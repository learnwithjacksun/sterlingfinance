import express from "express";
import cors from "cors";
import helmet from "helmet";
import { allowedOrigins, isProd } from "./config/env.js";
import { errorHandler, globalLimiter, notFoundHandler } from "./middleware/common.js";
import { router as authRouter } from "./routes/auth.js";
import { router as meRouter } from "./routes/me.js";
import { router as adminRouter } from "./routes/admin.js";

export function createApp() {
  const app = express();

  // Behind Render/Railway/Vercel proxies; needed for correct client IPs in rate limiting.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(
    cors({
      // Token auth (Authorization header), so no cookies/credentials are involved and
      // iOS cross-site tracking prevention cannot break sessions.
      origin(origin, cb) {
        if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) return cb(null, true);
        if (!isProd && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
        cb(null, false);
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      maxAge: 86400,
    }),
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(globalLimiter);

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/auth", authRouter);
  app.use("/api/me", meRouter);
  app.use("/api/admin", adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
