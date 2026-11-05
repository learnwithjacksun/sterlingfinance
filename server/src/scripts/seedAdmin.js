// Creates (or promotes) the first admin account and sets the admin passcode.
// Usage: INITIAL_ADMIN_EMAIL=... INITIAL_ADMIN_PASSWORD=... INITIAL_ADMIN_PASSCODE=... npm run seed:admin
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { Setting } from "../models/Auth.js";
import { hashPassword } from "../services/passwords.js";
import { generateAccountNumber } from "../services/accountNumber.js";

const { INITIAL_ADMIN_EMAIL: email, INITIAL_ADMIN_PASSWORD: password, INITIAL_ADMIN_PASSCODE: passcode } = env;

if (!email || !password || !passcode) {
  console.error("Set INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD and INITIAL_ADMIN_PASSCODE first.");
  process.exit(1);
}

await mongoose.connect(env.MONGO_URI);

const lower = email.toLowerCase();
let admin = await User.findOne({ email: lower });
if (admin) {
  admin.role = "admin";
  admin.passwordHash = await hashPassword(password);
  await admin.save();
  console.log(`Promoted existing user ${lower} to admin and reset their password.`);
} else {
  admin = await User.create({
    name: "Administrator",
    email: lower,
    role: "admin",
    isActive: true,
    passwordHash: await hashPassword(password),
    accountNumber: await generateAccountNumber(),
  });
  console.log(`Created admin ${lower}.`);
}

await Setting.findOneAndUpdate(
  { key: "adminPasscodeHash" },
  { value: await hashPassword(passcode) },
  { upsert: true },
);
console.log("Admin passcode set.");

await mongoose.disconnect();
