import mongoose from "mongoose";
import { randomToken } from "../utils/crypto.js";

const { Schema } = mongoose;

const transactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // Public, unique reference (the old `transactionId` was just the user id).
    reference: {
      type: String,
      unique: true,
      default: () => `TXN-${Date.now().toString(36)}-${randomToken(4)}`.toUpperCase(),
    },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["credit", "debit"], required: true },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    description: { type: String, default: "" },
    balanceAfter: { type: Number },
    meta: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform(_doc, ret) {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  },
);

transactionSchema.index({ user: 1, createdAt: -1 });

export const Transaction = mongoose.model("Transaction", transactionSchema);
