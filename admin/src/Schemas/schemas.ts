import { z } from "zod";

const amount = z
  .string()
  .min(1, { message: "Amount is required" })
  .refine((v) => Number(v) > 0, { message: "Enter an amount greater than zero" });

export const fundAccountSchema = z.object({
  account_name: z.string().min(1),
  account_number: z.string().min(1, { message: "Account number is required" }),
  amount,
  account_balance: z.string().min(1),
  transaction_type: z.string().min(1),
  description: z.string().min(1, { message: "Description is required" }),
});
export const debitAccountSchema = z.object({
  account_name: z.string().min(1),
  account_number: z.string().min(1, { message: "Account number is required" }),
  amount,
  account_balance: z.string().min(1),
  transaction_type: z.string().min(1),
  description: z.string().min(1, { message: "Description is required" }),
});


export const addCodeSchema = z.object({
  name: z.string().min(1, { message: "Transaction Code Name is required" }),
  code: z.string().min(1, { message: "Transaction Code is required" }),
  instructions: z.string().min(1, { message: "Instructions are required" }),
});

export const sendMessageSchema = z.object({
  message: z.string().min(1, { message: "Message is required" }),
  status: z.string().min(1, { message: "Status is required" }),
});

export const changePasscodeSchema = z.object({
  currentPasscode: z.string().min(1, { message: "Current passcode is required" }),
  newPasscode: z.string().min(4, { message: "Passcode must be at least 4 characters" }),
});
