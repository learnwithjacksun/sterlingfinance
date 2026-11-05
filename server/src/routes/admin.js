import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { Code } from "../models/Code.js";
import { Kyc, HelocApplication } from "../models/Kyc.js";
import { AuditLog, PasswordReset, RefreshToken, Setting } from "../models/Auth.js";
import { requireAdmin, requireAdminRole, requireAuth } from "../middleware/auth.js";
import { passcodeLimiter, upload, validate } from "../middleware/common.js";
import { hashPassword, hashPin, verifyHash } from "../services/passwords.js";
import { issueSession, revokeRefreshToken } from "../services/tokens.js";
import { sendPasswordResetEmail } from "../services/passwordReset.js";
import { generateAccountNumber } from "../services/accountNumber.js";
import { applyTransaction, changeTransactionStatus, runInTransaction } from "../services/ledger.js";
import { uploadImage } from "../services/imgbb.js";
import { sendSms } from "../services/sms.js";
import { sendMail } from "../services/mailer.js";
import { transactionEmail } from "../emails/templates.js";
import { badRequest, forbidden, notFound } from "../utils/errors.js";

export const router = Router();

const audit = (req, action, target, targetType, data) =>
  AuditLog.create({ actor: req.user._id, action, target, targetType, data, ip: req.ip }).catch((e) =>
    console.error("[audit] failed", e.message),
  );

const objectId = (name = "id") => (req, _res, next) => {
  if (!mongoose.isValidObjectId(req.params[name])) throw badRequest("Invalid identifier", "INVALID_ID");
  next();
};

const page = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(25),
});

// ---- Passcode step (admin must be logged in with role=admin first) -------------------

router.post(
  "/auth/passcode",
  requireAuth,
  requireAdminRole,
  passcodeLimiter,
  validate(z.object({ passcode: z.string().min(1).max(128), refreshToken: z.string().optional() })),
  async (req, res) => {
    const setting = await Setting.findOne({ key: "adminPasscodeHash" });
    if (!setting || !(await verifyHash(req.body.passcode, setting.value))) {
      await audit(req, "admin.passcode.failed", req.user._id, "User");
      throw forbidden("Incorrect passcode", "WRONG_PASSCODE");
    }
    await revokeRefreshToken(req.body.refreshToken);
    const session = await issueSession(req.user, { passcodeVerified: true, userAgent: req.headers["user-agent"] });
    res.json({ user: req.user, ...session });
  },
);

router.use(requireAuth, requireAdmin);

// ---- Users ------------------------------------------------------------------------------

router.get(
  "/users",
  validate(page.extend({ search: z.string().trim().max(100).optional(), role: z.enum(["user", "admin"]).optional() }), "query"),
  async (req, res) => {
    const { page: p, limit, search, role } = req.validated.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { email: rx }, { accountNumber: rx }, { phone: rx }];
    }
    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((p - 1) * limit).limit(limit),
      User.countDocuments(filter),
    ]);
    res.json({ items, total, page: p, limit });
  },
);

const optionalText = (max = 200) => z.string().trim().max(max).optional();
const profileFields = {
  name: z.string().trim().min(2).max(120),
  phone: optionalText(40),
  dob: optionalText(40),
  gender: optionalText(40),
  employmentStatus: optionalText(80),
  country: optionalText(80),
  street: optionalText(200),
  city: optionalText(80),
  state: optionalText(80),
  zip: optionalText(20),
  accountType: optionalText(60),
  currency: optionalText(10),
};
const pin = z.string().regex(/^\d{4,6}$/, "PIN must be 4 to 6 digits");

router.post(
  "/users",
  validate(
    z.object({
      ...profileFields,
      email: z.string().trim().toLowerCase().pipe(z.email()),
      // When omitted the user receives an email to set their own password.
      password: z.string().min(8).max(128).optional(),
      pin: pin.optional(),
      balance: z.coerce.number().min(0).optional(),
      isActive: z.boolean().optional(),
    }),
  ),
  async (req, res) => {
    const { password, pin: plainPin, ...rest } = req.body;
    const user = await User.create({
      ...rest,
      accountNumber: await generateAccountNumber(),
      passwordHash: password ? await hashPassword(password) : null,
      pinHash: plainPin ? await hashPin(plainPin) : null,
    });
    if (!password) await sendPasswordResetEmail(user, "invite");
    await audit(req, "user.create", user._id, "User", { email: user.email });
    res.status(201).json({ user });
  },
);

router.get("/users/:id", objectId(), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw notFound("User not found", "USER_NOT_FOUND");
  res.json({ user });
});

router.patch(
  "/users/:id",
  objectId(),
  upload.single("avatar"),
  validate(z.object({ ...Object.fromEntries(Object.entries(profileFields).map(([k, v]) => [k, v.optional()])), pin: pin.optional() })),
  async (req, res) => {
    const { pin: plainPin, ...changes } = req.body;
    // accountNumber, email, balance and password are deliberately not editable here.
    if (plainPin) changes.pinHash = await hashPin(plainPin);
    if (req.file) changes.avatar = await uploadImage(req.file);
    const user = await User.findByIdAndUpdate(req.params.id, changes, { new: true, runValidators: true });
    if (!user) throw notFound("User not found", "USER_NOT_FOUND");
    await audit(req, "user.update", user._id, "User", { fields: Object.keys(changes) });
    res.json({ user });
  },
);

router.patch("/users/:id/status", objectId(), validate(z.object({ isActive: z.boolean() })), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true });
  if (!user) throw notFound("User not found", "USER_NOT_FOUND");
  await audit(req, req.body.isActive ? "user.activate" : "user.deactivate", user._id, "User");
  res.json({ user });
});

router.patch("/users/:id/role", objectId(), validate(z.object({ role: z.enum(["user", "admin"]) })), async (req, res) => {
  if (String(req.user._id) === req.params.id) throw forbidden("You cannot change your own role", "SELF_ROLE_CHANGE");
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
  if (!user) throw notFound("User not found", "USER_NOT_FOUND");
  await audit(req, "user.role", user._id, "User", { role: req.body.role });
  res.json({ user });
});

router.post("/users/:id/send-reset", objectId(), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw notFound("User not found", "USER_NOT_FOUND");
  const sent = await sendPasswordResetEmail(user, user.passwordHash ? "reset" : "invite");
  res.json({ ok: true, sent });
});

router.delete("/users/:id", objectId(), async (req, res) => {
  if (String(req.user._id) === req.params.id) throw forbidden("You cannot delete your own account", "SELF_DELETE");
  const user = await User.findById(req.params.id);
  if (!user) throw notFound("User not found", "USER_NOT_FOUND");

  await runInTransaction(async (session) => {
    // Sequential on purpose: operations inside one Mongo transaction can't run in parallel.
    const opts = { session };
    for (const Model of [Transaction, Code, Kyc, HelocApplication, RefreshToken, PasswordReset]) {
      await Model.deleteMany({ user: user._id }, opts);
    }
    await User.deleteOne({ _id: user._id }, opts);
  });
  await audit(req, "user.delete", user._id, "User", { email: user.email });
  res.json({ ok: true });
});

// ---- Fund / debit -----------------------------------------------------------------------------

const moneySchema = z.object({
  amount: z.coerce.number().positive().max(1_000_000_000),
  description: z.string().trim().max(500).default(""),
  // "failed" is only reachable through a status change, which handles the refund.
  status: z.enum(["pending", "success"]).default("success"),
  notify: z.boolean().default(true),
});

for (const type of ["credit", "debit"]) {
  router.post(`/users/:id/${type === "credit" ? "fund" : "debit"}`, objectId(), validate(moneySchema), async (req, res) => {
    const { user, transaction } = await applyTransaction({
      userId: req.params.id,
      type,
      amount: req.body.amount,
      description: req.body.description || (type === "credit" ? "Account credited" : "Account debited"),
      status: req.body.status,
    });
    await audit(req, `user.${type}`, user._id, "User", { amount: transaction.amount, reference: transaction.reference });

    if (req.body.notify) {
      sendMail({
        to: user.email,
        name: user.name,
        ...transactionEmail({
          name: user.name,
          type,
          amount: transaction.amount,
          currency: user.currency,
          status: transaction.status,
          reference: transaction.reference,
          balance: user.balance,
        }),
      });
    }
    res.status(201).json({ user, transaction });
  });
}

// ---- Transactions -----------------------------------------------------------------------------

router.get(
  "/transactions",
  validate(
    page.extend({
      user: z.string().optional(),
      status: z.enum(["pending", "success", "failed"]).optional(),
      type: z.enum(["credit", "debit"]).optional(),
    }),
    "query",
  ),
  async (req, res) => {
    const { page: p, limit, user, status, type } = req.validated.query;
    const filter = {};
    if (user) {
      if (!mongoose.isValidObjectId(user)) throw badRequest("Invalid identifier", "INVALID_ID");
      filter.user = user;
    }
    if (status) filter.status = status;
    if (type) filter.type = type;
    const [items, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip((p - 1) * limit).limit(limit).populate("user", "name email currency"),
      Transaction.countDocuments(filter),
    ]);
    res.json({ items, total, page: p, limit });
  },
);

router.get("/transactions/:id", objectId(), async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).populate("user", "name email phone currency");
  if (!transaction) throw notFound("Transaction not found", "TRANSACTION_NOT_FOUND");
  res.json({ transaction });
});

router.patch(
  "/transactions/:id",
  objectId(),
  validate(z.object({ status: z.enum(["pending", "success", "failed"]) })),
  async (req, res) => {
    const { transaction, user } = await changeTransactionStatus(req.params.id, req.body.status);
    await audit(req, "transaction.status", transaction._id, "Transaction", {
      status: req.body.status,
      balanceAdjusted: Boolean(user),
    });
    res.json({ transaction, user });
  },
);

router.delete("/transactions/:id", objectId(), async (req, res) => {
  const transaction = await Transaction.findByIdAndDelete(req.params.id);
  if (!transaction) throw notFound("Transaction not found", "TRANSACTION_NOT_FOUND");
  await audit(req, "transaction.delete", transaction._id, "Transaction", { reference: transaction.reference });
  res.json({ ok: true });
});

router.post("/transactions/:id/sms", objectId(), validate(z.object({ message: z.string().trim().max(300).optional() })), async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).populate("user", "phone currency");
  if (!transaction) throw notFound("Transaction not found", "TRANSACTION_NOT_FOUND");
  if (!transaction.user?.phone) throw badRequest("User has no phone number", "NO_PHONE");
  const { currency } = transaction.user;
  await sendSms({
    to: transaction.user.phone,
    text:
      req.body.message ??
      `A ${transaction.type} of ${currency}${transaction.amount} (${transaction.status}) has occurred on your account. Ref ${transaction.reference}.`,
  });
  res.json({ ok: true });
});

// ---- Verification codes ------------------------------------------------------------------------

router.get("/users/:id/code", objectId(), async (req, res) => {
  res.json({ code: await Code.findOne({ user: req.params.id }) });
});

router.put(
  "/users/:id/code",
  objectId(),
  validate(
    z.object({
      codeName: z.string().trim().max(120).optional(),
      codeNumber: z.string().trim().max(120).optional(),
      instruction: z.string().trim().max(1000).optional(),
    }),
  ),
  async (req, res) => {
    const code = await Code.findOneAndUpdate({ user: req.params.id }, req.body, { new: true, upsert: true, setDefaultsOnInsert: true });
    res.json({ code });
  },
);

router.post(
  "/users/:id/code/message",
  objectId(),
  validate(z.object({ message: z.string().trim().min(1).max(1000), status: z.enum(["successful", "declined"]) })),
  async (req, res) => {
    const code = await Code.findOneAndUpdate({ user: req.params.id }, req.body, { new: true, upsert: true, setDefaultsOnInsert: true });
    res.json({ code });
  },
);

// ---- KYC ----------------------------------------------------------------------------------------

const reviewStatus = z.object({ status: z.enum(["pending", "approved", "rejected"]) });

router.get("/kyc", validate(page, "query"), async (req, res) => {
  const { page: p, limit } = req.validated.query;
  const [items, total] = await Promise.all([
    Kyc.find().sort({ createdAt: -1 }).skip((p - 1) * limit).limit(limit).populate("user", "name email"),
    Kyc.countDocuments(),
  ]);
  res.json({ items, total, page: p, limit });
});

router.patch("/kyc/:id", objectId(), validate(reviewStatus), async (req, res) => {
  const kyc = await Kyc.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!kyc) throw notFound("Submission not found", "KYC_NOT_FOUND");
  res.json({ kyc });
});

router.get("/heloc", validate(page, "query"), async (req, res) => {
  const { page: p, limit } = req.validated.query;
  const [items, total] = await Promise.all([
    HelocApplication.find().sort({ createdAt: -1 }).skip((p - 1) * limit).limit(limit).populate("user", "name email"),
    HelocApplication.countDocuments(),
  ]);
  res.json({ items, total, page: p, limit });
});

router.patch("/heloc/:id", objectId(), validate(reviewStatus), async (req, res) => {
  const application = await HelocApplication.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!application) throw notFound("Application not found", "HELOC_NOT_FOUND");
  res.json({ application });
});

// ---- Settings -------------------------------------------------------------------------------------

router.put(
  "/settings/passcode",
  passcodeLimiter,
  validate(z.object({ currentPasscode: z.string().min(1), newPasscode: z.string().min(4).max(128) })),
  async (req, res) => {
    const setting = await Setting.findOne({ key: "adminPasscodeHash" });
    if (setting && !(await verifyHash(req.body.currentPasscode, setting.value))) {
      throw forbidden("Current passcode is incorrect", "WRONG_PASSCODE");
    }
    await Setting.findOneAndUpdate(
      { key: "adminPasscodeHash" },
      { value: await hashPassword(req.body.newPasscode) },
      { upsert: true },
    );
    await audit(req, "settings.passcode", undefined, "Setting");
    res.json({ ok: true });
  },
);
