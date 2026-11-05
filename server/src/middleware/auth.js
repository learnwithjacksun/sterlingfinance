import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { forbidden, unauthorized } from "../utils/errors.js";

/** Requires a valid `Authorization: Bearer <accessToken>` and loads req.user. */
export async function requireAuth(req, _res, next) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw unauthorized();

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    throw unauthorized(
      err.name === "TokenExpiredError" ? "Access token expired" : "Invalid token",
      err.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
    );
  }

  const user = await User.findById(payload.sub).select("+tokenVersion");
  if (!user || (user.tokenVersion ?? 0) !== payload.tv) throw unauthorized("Session expired", "SESSION_EXPIRED");

  req.user = user;
  req.auth = { passcodeVerified: Boolean(payload.pc) };
  next();
}

/** Admin API: requires role=admin on top of requireAuth. Passcode step optional. */
export function requireAdminRole(req, _res, next) {
  if (req.user?.role !== "admin") throw forbidden("Admin access required", "ADMIN_REQUIRED");
  next();
}

/** Admin API: requires role=admin AND a passcode-verified session. */
export function requireAdmin(req, _res, next) {
  if (req.user?.role !== "admin") throw forbidden("Admin access required", "ADMIN_REQUIRED");
  if (!req.auth?.passcodeVerified) throw forbidden("Admin passcode required", "PASSCODE_REQUIRED");
  next();
}
