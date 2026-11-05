import { z } from "zod";

const profileFields = {
  name: z.string().min(1, { message: "Name is required" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  gender: z.string().min(1, { message: "Gender is required" }),
  employment_status: z.string().min(1, { message: "Employment status is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  accountType: z.string().min(1, { message: "Account type is required" }),
  currency: z.string().min(1, { message: "Currency is required" }),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().min(1, { message: "State is required" }),
  zip: z.string().min(1, { message: "Zip code is required" }),
};

const pin = z.string().regex(/^\d{4,6}$/, { message: "PIN must be 4 to 6 digits" });

/** Admin "create user". Leave the password empty to email the user a link to set their own. */
export const registerSchema = z.object({
  ...profileFields,
  email: z.string().email({ message: "Invalid email address" }),
  dob: z.string().min(1, { message: "Date of birth is required" }),
  pin,
  password: z
    .string()
    .refine((v) => v === "" || v.length >= 8, { message: "Password must be at least 8 characters" })
    .optional(),
});

/** Admin "edit user": email, date of birth and password are read-only; a blank PIN keeps the current one. */
export const editUserSchema = z.object({
  ...profileFields,
  email: z.string().optional(),
  dob: z.string().optional(),
  pin: z.union([z.literal(""), pin]).optional(),
});
