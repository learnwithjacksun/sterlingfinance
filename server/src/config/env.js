import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
  RESET_TOKEN_TTL_MINUTES: z.coerce.number().default(45),

  // Comma separated list of allowed browser origins (CORS) and link bases for emails.
  CLIENT_URL: z.string().default("http://localhost:3000"),
  ADMIN_URL: z.string().default("http://localhost:3001"),

  BREVO_API_KEY: z.string().optional(),
  BREVO_SENDER_EMAIL: z.string().optional(),
  BREVO_SENDER_NAME: z.string().default("Sterling Holdings"),

  IMGBB_API_KEY: z.string().optional(),

  INFOBIP_API_KEY: z.string().optional(),
  INFOBIP_BASE_URL: z.string().default("https://api.infobip.com"),
  INFOBIP_SENDER: z.string().default("InfoSMS"),

  INITIAL_ADMIN_EMAIL: z.string().optional(),
  INITIAL_ADMIN_PASSWORD: z.string().optional(),
  INITIAL_ADMIN_PASSCODE: z.string().optional(),
});

const parsed = schema.safeParse({
  ...process.env,
  // The existing .env used the Vite name for the imgbb key.
  IMGBB_API_KEY: process.env.IMGBB_API_KEY ?? process.env.VITE_IMG_API_KEY,
});

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) {
    console.error(` - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
export const allowedOrigins = [env.CLIENT_URL, env.ADMIN_URL]
  .flatMap((v) => v.split(","))
  .map((v) => v.trim().replace(/\/$/, ""))
  .filter(Boolean);
