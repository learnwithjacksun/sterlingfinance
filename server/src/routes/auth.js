import { Router } from "express";
import { z } from "zod";
import { User } from "../models/User.js";
import { PasswordReset } from "../models/Auth.js";
import { authLimiter, validate } from "../middleware/common.js";
import { requireAuth } from "../middleware/auth.js";
import { burnPasswordCheck, hashPassword, hashPin, verifyHash } from "../services/passwords.js";
import { issueSession, revokeAllSessions, revokeRefreshToken, rotateSession } from "../services/tokens.js";
import { sendPasswordResetEmail } from "../services/passwordReset.js";
import { generateAccountNumber } from "../services/accountNumber.js";
import { sendMail } from "../services/mailer.js";
import { welcomeEmail } from "../emails/templates.js";
import { sha256 } from "../utils/crypto.js";
import { ApiError, badRequest, conflict, unauthorized } from "../utils/errors.js";

export const router = Router();

const MAX_FAILED_LOGINS = 8;
const LOCK_MINUTES = 15;

const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email"));
const password = z.string().min(8, "Password must be at least 8 characters").max(128);
const pin = z.string().regex(/^\d{4,6}$/, "PIN must be 4 to 6 digits");
const text = (max = 200) => z.string().trim().max(max).default("");

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email,
  password,
  pin,
  phone: text(40),
  dob: text(40),
  gender: text(40),
  employmentStatus: text(80),
  country: text(80),
  street: text(200),
  city: text(80),
  state: text(80),
  zip: text(20),
  accountType: text(60),
  currency: text(10).transform((v) => v || "$"),
});

const userAgent = (req) => req.headers["user-agent"];

router.post("/register", authLimiter, validate(registerSchema), async (req, res) => {
  const body = req.body;
  if (await User.exists({ email: body.email })) {
    throw conflict("An account with this email already exists", "EMAIL_EXISTS");
  }
  const { password: plain, pin: plainPin, ...profile } = body;
  const user = await User.create({
    ...profile,
    passwordHash: await hashPassword(plain),
    pinHash: await hashPin(plainPin),
    accountNumber: await generateAccountNumber(),
  });

  // Fire and forget: email trouble must not block sign-up.
  sendMail({ to: user.email, name: user.name, ...welcomeEmail({ name: user.name }) });

  const session = await issueSession(user, { userAgent: userAgent(req) });
  res.status(201).json({ user, ...session });
});

const loginSchema = z.object({ email, password: z.string().min(1).max(128) });

router.post("/login", authLimiter, validate(loginSchema), async (req, res) => {
  const { email: addr, password: plain } = req.body;
  const user = await User.findOne({ email: addr }).select("+passwordHash +failedLogins +lockUntil +tokenVersion");

  // Also covers admin-invited users who haven't set a password yet.
  if (!user || !user.passwordHash) {
    await burnPasswordCheck(plain);
    throw unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new ApiError(429, "ACCOUNT_LOCKED", "Too many failed attempts. Try again later or reset your password.");
  }

  if (!(await verifyHash(plain, user.passwordHash))) {
    user.failedLogins = (user.failedLogins ?? 0) + 1;
    if (user.failedLogins >= MAX_FAILED_LOGINS) {
      user.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
      user.failedLogins = 0;
    }
    await user.save();
    throw unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
  }

  if (user.failedLogins || user.lockUntil) {
    user.failedLogins = 0;
    user.lockUntil = null;
    await user.save();
  }

  const session = await issueSession(user, { userAgent: userAgent(req) });
  res.json({ user, ...session });
});

router.post("/refresh", authLimiter, validate(z.object({ refreshToken: z.string().min(10) })), async (req, res) => {
  const { user, ...session } = await rotateSession(req.body.refreshToken, userAgent(req));
  res.json({ user, ...session });
});

router.post("/logout", validate(z.object({ refreshToken: z.string().optional() })), async (req, res) => {
  await revokeRefreshToken(req.body.refreshToken);
  res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Always answers 200 so the endpoint can't be used to probe which emails exist.
router.post("/forgot-password", authLimiter, validate(z.object({ email })), async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    await sendPasswordResetEmail(user, user.passwordHash ? "reset" : "invite");
  }
  res.json({ ok: true, message: "If that email is registered, a reset link has been sent." });
});

router.post(
  "/reset-password",
  authLimiter,
  validate(z.object({ token: z.string().min(10), password })),
  async (req, res) => {
    const record = await PasswordReset.findOneAndUpdate(
      { tokenHash: sha256(req.body.token), usedAt: null, expiresAt: { $gt: new Date() } },
      { usedAt: new Date() },
    );
    if (!record) throw badRequest("This reset link is invalid or has expired", "INVALID_RESET_TOKEN");

    const user = await User.findById(record.user).select("+tokenVersion");
    if (!user) throw badRequest("This reset link is invalid or has expired", "INVALID_RESET_TOKEN");

    user.passwordHash = await hashPassword(req.body.password);
    user.failedLogins = 0;
    user.lockUntil = null;
    await user.save();
    await revokeAllSessions(user._id);

    const session = await issueSession(user, { userAgent: userAgent(req) });
    res.json({ user, ...session });
  },
);

router.post(
  "/change-password",
  requireAuth,
  authLimiter,
  validate(z.object({ currentPassword: z.string().min(1), newPassword: password })),
  async (req, res) => {
    const user = await User.findById(req.user._id).select("+passwordHash +tokenVersion");
    if (!(await verifyHash(req.body.currentPassword, user.passwordHash))) {
      throw badRequest("Current password is incorrect", "WRONG_PASSWORD");
    }
    user.passwordHash = await hashPassword(req.body.newPassword);
    await user.save();
    await revokeAllSessions(user._id);

    const fresh = await User.findById(user._id).select("+tokenVersion");
    const session = await issueSession(fresh, {
      passcodeVerified: req.auth.passcodeVerified,
      userAgent: userAgent(req),
    });
    res.json({ user: fresh, ...session });
  },
);
