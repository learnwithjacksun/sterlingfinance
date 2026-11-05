import crypto from "node:crypto";

export const randomToken = (bytes = 48) => crypto.randomBytes(bytes).toString("hex");

export const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

export const randomDigits = (length) => {
  let out = "";
  for (let i = 0; i < length; i++) out += crypto.randomInt(0, 10);
  return out;
};

export const roundMoney = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
