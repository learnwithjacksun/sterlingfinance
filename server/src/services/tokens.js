import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { RefreshToken } from "../models/Auth.js";
import { User } from "../models/User.js";
import { randomToken, sha256 } from "../utils/crypto.js";
import { unauthorized } from "../utils/errors.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export function signAccessToken(user, { passcodeVerified = false } = {}) {
  const tokenVersion = user.tokenVersion ?? 0;
  const token = jwt.sign(
    { role: user.role, tv: tokenVersion, pc: passcodeVerified },
    env.JWT_SECRET,
    { subject: String(user._id), expiresIn: env.ACCESS_TOKEN_TTL },
  );
  const { exp } = jwt.decode(token);
  return { token, expiresAt: exp * 1000 };
}

async function createRefreshToken(userId, { family, passcodeVerified, userAgent }) {
  const raw = randomToken();
  await RefreshToken.create({
    user: userId,
    tokenHash: sha256(raw),
    family: family ?? randomToken(16),
    passcodeVerified,
    userAgent: userAgent?.slice(0, 200),
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * DAY_MS),
  });
  return raw;
}

/** Issues a fresh access + refresh token pair (login, register, password reset). */
export async function issueSession(user, { passcodeVerified = false, userAgent } = {}) {
  // `tokenVersion` is select:false, make sure it is on the document being signed.
  const fresh = user.tokenVersion === undefined ? await User.findById(user._id).select("+tokenVersion") : user;
  const access = signAccessToken(fresh, { passcodeVerified });
  const refreshToken = await createRefreshToken(user._id, { passcodeVerified, userAgent });
  return { accessToken: access.token, accessTokenExpiresAt: access.expiresAt, refreshToken };
}

/** Rotates a refresh token. Reuse of an already-rotated token revokes the whole chain. */
export async function rotateSession(rawToken, userAgent) {
  const record = await RefreshToken.findOne({ tokenHash: sha256(rawToken) });
  if (!record || record.expiresAt < new Date()) throw unauthorized("Session expired", "SESSION_EXPIRED");

  if (record.revokedAt) {
    await RefreshToken.updateMany({ family: record.family, revokedAt: null }, { revokedAt: new Date() });
    throw unauthorized("Session expired", "SESSION_EXPIRED");
  }

  const user = await User.findById(record.user).select("+tokenVersion");
  if (!user) throw unauthorized("Session expired", "SESSION_EXPIRED");

  // Atomic claim so two parallel refreshes cannot both succeed.
  const claimed = await RefreshToken.findOneAndUpdate(
    { _id: record._id, revokedAt: null },
    { revokedAt: new Date() },
  );
  if (!claimed) throw unauthorized("Session expired", "SESSION_EXPIRED");

  const access = signAccessToken(user, { passcodeVerified: record.passcodeVerified });
  const refreshToken = await createRefreshToken(user._id, {
    family: record.family,
    passcodeVerified: record.passcodeVerified,
    userAgent,
  });
  return { user, accessToken: access.token, accessTokenExpiresAt: access.expiresAt, refreshToken };
}

export async function revokeRefreshToken(rawToken) {
  if (!rawToken) return;
  const record = await RefreshToken.findOne({ tokenHash: sha256(rawToken) });
  if (record) await RefreshToken.updateMany({ family: record.family, revokedAt: null }, { revokedAt: new Date() });
}

export async function revokeAllSessions(userId) {
  await RefreshToken.updateMany({ user: userId, revokedAt: null }, { revokedAt: new Date() });
  await User.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
}
