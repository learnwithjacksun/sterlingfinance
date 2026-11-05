import { Router } from "express";
import { z } from "zod";
import { User } from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { Kyc, HelocApplication } from "../models/Kyc.js";
import { requireAuth } from "../middleware/auth.js";
import { upload, validate } from "../middleware/common.js";
import { hashPin, verifyHash } from "../services/passwords.js";
import { uploadImage } from "../services/imgbb.js";
import { applyTransaction } from "../services/ledger.js";
import { sendMail } from "../services/mailer.js";
import { transactionEmail } from "../emails/templates.js";
import { badRequest } from "../utils/errors.js";

export const router = Router();
router.use(requireAuth);

router.get("/", (req, res) => res.json({ user: req.user }));

const pin = z.string().regex(/^\d{4,6}$/, "PIN must be 4 to 6 digits");
// Imported PINs may not follow today's format, so only verification is lenient.
const existingPin = z.string().min(1).max(30);

router.patch(
  "/pin",
  validate(z.object({ currentPin: existingPin.optional(), newPin: pin })),
  async (req, res) => {
    const user = await User.findById(req.user._id).select("+pinHash");
    if (user.pinHash && !(await verifyHash(req.body.currentPin ?? "", user.pinHash))) {
      throw badRequest("Current PIN is incorrect", "WRONG_PIN");
    }
    user.pinHash = await hashPin(req.body.newPin);
    await user.save();
    res.json({ user });
  },
);

router.patch("/avatar", upload.single("avatar"), async (req, res) => {
  if (!req.file) throw badRequest("Choose an image to upload", "FILE_REQUIRED");
  const url = await uploadImage(req.file);
  const user = await User.findByIdAndUpdate(req.user._id, { avatar: url }, { new: true });
  res.json({ user });
});

// ---- Transactions ----------------------------------------------------------------

const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

router.get("/transactions", validate(listQuery, "query"), async (req, res) => {
  const { page, limit } = req.validated.query;
  const filter = { user: req.user._id };
  const [items, total] = await Promise.all([
    Transaction.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Transaction.countDocuments(filter),
  ]);
  res.json({ items, total, page, limit });
});

const transferSchema = z.object({
  amount: z.coerce.number().positive().max(1_000_000_000),
  description: z.string().trim().max(500).default(""),
  pin: existingPin,
  // Free-form recipient details (bank, account name/number, ...), stored on the ledger row.
  recipient: z.record(z.string(), z.any()).optional(),
});

router.post("/transfer", validate(transferSchema), async (req, res) => {
  const user = await User.findById(req.user._id).select("+pinHash");
  if (!user.isActive) {
    return res.status(403).json({ error: { code: "ACCOUNT_INACTIVE", message: "Your account is not active" } });
  }
  if (!(await verifyHash(req.body.pin, user.pinHash))) {
    throw badRequest("Incorrect PIN", "WRONG_PIN");
  }

  const { user: updated, transaction } = await applyTransaction({
    userId: user._id,
    type: "debit",
    amount: req.body.amount,
    description: req.body.description,
    status: "pending",
    meta: req.body.recipient ? { recipient: req.body.recipient } : undefined,
    requireActive: true,
  });

  sendMail({
    to: updated.email,
    name: updated.name,
    ...transactionEmail({
      name: updated.name,
      type: "debit",
      amount: transaction.amount,
      currency: updated.currency,
      status: transaction.status,
      reference: transaction.reference,
      balance: updated.balance,
    }),
  });

  res.status(201).json({ transaction, user: updated });
});

// ---- KYC ---------------------------------------------------------------------------

const idmeSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  dateOfBirth: z.string().trim().min(1).max(40),
  email: z.string().trim().max(200),
  phone: z.string().trim().max(40),
  address: z.string().trim().max(300),
  idType: z.enum(["drivers_license", "passport", "state_id"]),
  idNumber: z.string().trim().min(1).max(60),
});

router.post(
  "/kyc/idme",
  upload.fields([
    { name: "frontIdImg", maxCount: 1 },
    { name: "backIdImg", maxCount: 1 },
  ]),
  validate(idmeSchema),
  async (req, res) => {
    const front = req.files?.frontIdImg?.[0];
    const back = req.files?.backIdImg?.[0];
    if (!front || !back) throw badRequest("Front and back ID images are required", "FILE_REQUIRED");

    const [frontIdImg, backIdImg] = await Promise.all([uploadImage(front), uploadImage(back)]);
    const kyc = await Kyc.create({ ...req.body, user: req.user._id, frontIdImg, backIdImg });
    res.status(201).json({ kyc });
  },
);

const helocSchema = z.object({
  propertyAddress: z.string().trim().min(1).max(300),
  propertyType: z.string().trim().min(1).max(80),
  estimatedValue: z.string().trim().min(1).max(40),
  loanAmount: z.string().trim().min(1).max(40),
  employmentStatus: z.string().trim().min(1).max(80),
  annualIncome: z.string().trim().min(1).max(40),
  creditScore: z.string().trim().min(1).max(10),
  existingMortgage: z.string().trim().min(1).max(10),
  mortgageBalance: z.string().trim().max(40).optional(),
  purpose: z.string().trim().min(1).max(500),
});

router.post("/kyc/heloc", validate(helocSchema), async (req, res) => {
  const application = await HelocApplication.create({ ...req.body, user: req.user._id });
  res.status(201).json({ application });
});
