import { z } from "zod";


export const transferSchema = z.object({
    account_name: z.string().min(1, { message: "Account name is required" }),
    account_number: z.string().min(10, { message: "Account number must be at least 10 digits" }),
    bank_name: z.string().min(1, { message: "Bank name is required" }),
    bank_address: z.string().min(1, { message: "Bank address is required" }),
    swift_code: z.string().min(1, { message: "Swift code is required" }),
    routing_number: z.string().min(1, { message: "Routing number is required" }),
    amount: z.string().min(1, { message: "Amount is required" }).refine((v) => Number(v) > 0, { message: "Enter an amount greater than zero" }),
    transaction_pin: z.string().regex(/^\d{4,6}$/, { message: "Transaction pin must be 4 to 6 digits" }),
})


