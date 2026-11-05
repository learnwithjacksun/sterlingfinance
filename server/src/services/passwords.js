import bcrypt from "bcryptjs";

export const hashPassword = (password) => bcrypt.hash(password, 12);
export const hashPin = (pin) => bcrypt.hash(pin, 10);

export const verifyHash = (plain, hash) => (hash ? bcrypt.compare(plain, hash) : Promise.resolve(false));

// A throwaway hash so unknown-email logins take as long as real ones.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);
export const burnPasswordCheck = (plain) => bcrypt.compare(plain, DUMMY_HASH);
