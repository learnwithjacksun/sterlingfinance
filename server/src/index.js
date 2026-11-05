import mongoose from "mongoose";
import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { getBrevo } from "./services/mailer.js";

await mongoose.connect(env.MONGO_URI);
console.log("MongoDB connected");

// Make sure unique/TTL indexes exist before taking traffic.
await mongoose.syncIndexes();

const app = createApp();
const server = app.listen(env.PORT, () => {
  console.log(`API listening on :${env.PORT}`);
  getBrevo()?.catch((e) => console.error("[mailer] could not load Brevo SDK:", e.message));
});

const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down`);
  server.close();
  await mongoose.disconnect();
  process.exit(0);
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
