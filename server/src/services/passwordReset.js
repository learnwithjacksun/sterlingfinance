import { env } from "../config/env.js";
import { PasswordReset } from "../models/Auth.js";
import { randomToken, sha256 } from "../utils/crypto.js";
import { resetPasswordEmail } from "../emails/templates.js";
import { sendMail } from "./mailer.js";

/**
 * Creates a single-use reset token and emails the link.
 * reason: "reset" | "invite" (admin-created user)
 */
export async function sendPasswordResetEmail(user, reason = "reset") {
  // Only the newest link stays valid.
  await PasswordReset.deleteMany({ user: user._id, usedAt: null });

  const raw = randomToken(32);
  await PasswordReset.create({
    user: user._id,
    tokenHash: sha256(raw),
    expiresAt: new Date(Date.now() + env.RESET_TOKEN_TTL_MINUTES * 60 * 1000),
  });

  const base = (user.role === "admin" ? env.ADMIN_URL : env.CLIENT_URL).split(",")[0].trim().replace(/\/$/, "");
  const link = `${base}/reset-password?token=${raw}`;
  const mail = resetPasswordEmail({ name: user.name, link, minutes: env.RESET_TOKEN_TTL_MINUTES, reason });
  return sendMail({ to: user.email, name: user.name, ...mail });
}
