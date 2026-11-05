import { User } from "../models/User.js";
import { randomDigits } from "../utils/crypto.js";

/** Generates a unique 10-digit account number (never starts with 0). */
export async function generateAccountNumber() {
  for (let i = 0; i < 10; i++) {
    const candidate = String(1 + Math.floor(Math.random() * 9)) + randomDigits(9);
    if (!(await User.exists({ accountNumber: candidate }))) return candidate;
  }
  throw new Error("Could not generate a unique account number");
}
