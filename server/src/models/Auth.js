import mongoose from "mongoose";

const { Schema } = mongoose;

// Opaque refresh tokens (stored hashed). `family` links a rotation chain so a reused
// (stolen) token can revoke the whole chain.
const refreshTokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  family: { type: String, required: true, index: true },
  // Admin sessions remember whether the second-step passcode was verified.
  passcodeVerified: { type: Boolean, default: false },
  revokedAt: { type: Date, default: null },
  userAgent: String,
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  createdAt: { type: Date, default: Date.now },
});

const passwordResetSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  usedAt: { type: Date, default: null },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  createdAt: { type: Date, default: Date.now },
});

// Single-document key/value settings (holds the hashed admin passcode).
const settingSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: Schema.Types.Mixed,
});

const auditLogSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", index: true },
    action: { type: String, required: true },
    target: { type: Schema.Types.ObjectId },
    targetType: String,
    data: Schema.Types.Mixed,
    ip: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
export const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);
export const Setting = mongoose.model("Setting", settingSchema);
export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
