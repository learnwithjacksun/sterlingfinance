import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { roundMoney } from "../utils/crypto.js";
import { ApiError, badRequest, notFound } from "../utils/errors.js";
import { isProd } from "../config/env.js";

/**
 * Runs `fn(session)` inside a Mongo transaction. Standalone MongoDB (local dev) has no
 * transaction support, so outside production we fall back to running without one.
 */
export async function runInTransaction(fn) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } catch (err) {
    const noTxnSupport = err?.code === 20 || /replica set|Transaction numbers/i.test(err?.message ?? "");
    if (noTxnSupport && !isProd) {
      console.warn("[ledger] MongoDB transactions unavailable (standalone). Running without one.");
      return fn(null);
    }
    throw err;
  } finally {
    await session.endSession();
  }
}

/**
 * Changes a transaction's status. Debits that move into "failed" are refunded to the
 * user's balance; moving a debit back out of "failed" charges it again (and fails with
 * INSUFFICIENT_FUNDS if the user can no longer cover it). Credits only change status.
 */
export async function changeTransactionStatus(transactionId, newStatus) {
  return runInTransaction(async (session) => {
    const current = await Transaction.findById(transactionId).session(session);
    if (!current) throw notFound("Transaction not found", "TRANSACTION_NOT_FOUND");
    if (current.status === newStatus) return { transaction: current, user: null };

    // Compare-and-set on the old status so two admins can't both trigger the refund.
    const transaction = await Transaction.findOneAndUpdate(
      { _id: current._id, status: current.status },
      { status: newStatus },
      { new: true, session },
    );
    if (!transaction) throw badRequest("Transaction was changed by someone else, reload and retry", "STALE_TRANSACTION");

    let user = null;
    if (current.type === "debit") {
      const refund = newStatus === "failed" && current.status !== "failed";
      const recharge = current.status === "failed" && newStatus !== "failed";
      if (refund || recharge) {
        const filter = { _id: current.user };
        if (recharge) filter.balance = { $gte: current.amount };
        user = await User.findOneAndUpdate(
          filter,
          { $inc: { balance: refund ? current.amount : -current.amount } },
          { new: true, session },
        );
        if (!user) {
          if (!(await User.exists({ _id: current.user }).session(session))) {
            throw notFound("User not found", "USER_NOT_FOUND");
          }
          throw badRequest("Insufficient funds to re-apply this debit", "INSUFFICIENT_FUNDS");
        }
        const rounded = roundMoney(user.balance);
        if (rounded !== user.balance) {
          user.balance = rounded;
          await user.save({ session });
        }
      }
    }
    return { transaction, user };
  });
}

/**
 * Atomically moves money on a user's balance and writes the matching ledger entry.
 * Debits use a conditional update so the balance can never go negative, even under
 * concurrent requests. All amounts are positive; `type` decides the direction.
 */
export async function applyTransaction({
  userId,
  type,
  amount,
  description = "",
  status = "success",
  meta,
  requireActive = false,
}) {
  const value = roundMoney(amount);
  if (!(value > 0)) throw badRequest("Amount must be greater than zero", "INVALID_AMOUNT");

  return runInTransaction(async (session) => {
    const filter = { _id: userId };
    if (requireActive) filter.isActive = true;
    if (type === "debit") filter.balance = { $gte: value };

    const updated = await User.findOneAndUpdate(
      filter,
      { $inc: { balance: type === "debit" ? -value : value } },
      { new: true, session },
    );

    if (!updated) {
      const exists = await User.findById(userId).session(session);
      if (!exists) throw notFound("User not found", "USER_NOT_FOUND");
      if (requireActive && !exists.isActive)
        throw new ApiError(403, "ACCOUNT_INACTIVE", "Your account is not active");
      throw badRequest("Insufficient funds", "INSUFFICIENT_FUNDS");
    }

    // Floating point drift guard: keep stored balance at 2dp.
    const balanceAfter = roundMoney(updated.balance);
    if (balanceAfter !== updated.balance) {
      updated.balance = balanceAfter;
      await updated.save({ session });
    }

    const [transaction] = await Transaction.create(
      [{ user: userId, type, amount: value, description, status, meta, balanceAfter }],
      { session },
    );
    return { user: updated, transaction };
  });
}
