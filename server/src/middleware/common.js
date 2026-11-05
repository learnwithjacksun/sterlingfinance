import multer from "multer";
import rateLimit from "express-rate-limit";
import { ZodError } from "zod";
import { ApiError, badRequest } from "../utils/errors.js";
import { isProd } from "../config/env.js";

/** validate(schema) parses req.body and replaces it with the cleaned value. */
export const validate = (schema, source = "body") => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    throw badRequest("Validation failed", "VALIDATION_ERROR", result.error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    })));
  }
  // Express 5 makes req.query a getter, so only body can be reassigned.
  if (source === "body") req.body = result.data;
  else req.validated = { ...req.validated, [source]: result.data };
  next();
};

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 2 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(png|jpe?g|webp)$/.test(file.mimetype)) return cb(null, true);
    cb(badRequest("Only png, jpg or webp images are allowed", "INVALID_FILE"));
  },
});

const limiter = (windowMinutes, max) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skip: () => !isProd && process.env.DISABLE_RATE_LIMIT === "1",
    handler: (_req, res) =>
      res.status(429).json({ error: { code: "RATE_LIMITED", message: "Too many attempts, try again later" } }),
  });

export const globalLimiter = limiter(15, 600);
export const authLimiter = limiter(15, 30);
export const passcodeLimiter = limiter(15, 10);

export function notFoundHandler(_req, _res, next) {
  next(new ApiError(404, "NOT_FOUND", "Route not found"));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = err.status ?? 500;
  let code = err.code ?? "INTERNAL_ERROR";
  let message = err.message;
  let details = err.details;

  if (err instanceof ZodError) {
    status = 400;
    code = "VALIDATION_ERROR";
    message = "Validation failed";
    details = err.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
  } else if (err instanceof multer.MulterError) {
    status = 400;
    code = "INVALID_FILE";
    message = err.code === "LIMIT_FILE_SIZE" ? "Image must be 5MB or smaller" : err.message;
  } else if (err?.code === 11000) {
    status = 409;
    code = "DUPLICATE";
    message = `${Object.keys(err.keyPattern ?? {})[0] ?? "Value"} already exists`;
  } else if (err?.name === "CastError") {
    status = 400;
    code = "INVALID_ID";
    message = "Invalid identifier";
  } else if (err?.type === "entity.parse.failed") {
    status = 400;
    code = "INVALID_JSON";
    message = "Malformed JSON body";
  } else if (!(err instanceof ApiError)) {
    status = 500;
    code = "INTERNAL_ERROR";
    message = "Something went wrong";
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ error: { code, message, ...(details ? { details } : {}) } });
}
