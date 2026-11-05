import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
    dob: z.string().min(1, {message: "Date of birth is required"}),
    gender: z.string().min(1, {message: "Gender is required"}),
    employment_status: z.string().min(1, {message: "Gender is required"}),
    country: z.string().min(1, { message: "Country is required" }),
    address: z.string().min(1, { message: "Address is required" }),
    accountType: z.string().min(1, { message: "Account type is required" }),
    currency: z.string().min(1, { message: "Currency is required" }),
    city: z.string().min(1, { message: "City is required" }),
    state: z.string().min(1, { message: "State is required" }),
    zip: z.string().min(1, { message: "Zip code is required" }),
    pin: z.string().regex(/^\d{4,6}$/, { message: "PIN must be 4 to 6 digits" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  });