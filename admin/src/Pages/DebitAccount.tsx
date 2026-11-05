import { Wrapper } from "@/Layouts";
import { useNavigate, useParams } from "react-router-dom";
import { useFinanceStore } from "@/Stores";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { formatNumber } from "@/Utils/formatNumber";
import { Container } from "@/Components/Dashboard";
import { debitAccountSchema } from "@/Schemas/schemas";
import { useUser } from "@/Hooks";
import { useEffect } from "react";

type FormSchema = z.infer<typeof debitAccountSchema>;

const DebitAccount = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { debit, isLoading } = useFinanceStore();
  const { user } = useUser(id);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormSchema>({
    resolver: zodResolver(debitAccountSchema),
    defaultValues: { transaction_type: "debit" },
  });

  // Fill the read-only fields once the user has loaded (and after the balance changes).
  useEffect(() => {
    if (!user) return;
    reset({
      account_name: user.name,
      account_number: user.accountNumber,
      account_balance: `${user.currency} ${formatNumber(user.balance)}`,
      transaction_type: "debit",
      amount: "",
      description: "",
    });
  }, [user?.id, user?.balance, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  // Insufficient funds are rejected by the server, atomically with the debit.
  const onSubmit = (data: FormSchema) => {
    if (!user?.id) return;
    toast.promise(debit(user.id, { amount: Number(data.amount), description: data.description }), {
      loading: "Debiting account...",
      success: () => {
        navigate(`/user/${user.id}/transactions`);
        return "Account debited successfully";
      },
      error: (e: Error) => e.message || "Failed to debit account",
    });
  };

  return (
    <Wrapper userData={user}>
      <Container title="Debit Account">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="account_name" className="text-sm">
                Account Name
              </label>
              <input
                type="text"
                id="account_name"
                placeholder="Enter Beneficiary Account Name"
                className="input w-full"
                readOnly
                {...register("account_name")}
              />
              {errors.account_name && (
                <p className="text-red-500 text-sm">
                  {errors.account_name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="account_number" className="text-sm">
                Account Number
              </label>
              <input
                type="text"
                id="account_number"
                placeholder="Enter Beneficiary Account Number"
                className="input w-full"
                readOnly
                {...register("account_number")}
              />
              {errors.account_number && (
                <p className="text-red-500 text-sm">
                  {errors.account_number.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm">
                Amount
              </label>
              <input
                type="text"
                id="amount"
                placeholder="Enter Amount"
                className="input w-full"
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-red-500 text-sm">{errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm">
                Account Balance
              </label>
              <input
                type="text"
                id="account_balance"
                placeholder="Enter Account Balance"
                className="input w-full"
                readOnly
                {...register("account_balance")}
              />
              {errors.account_balance && (
                <p className="text-red-500 text-sm">
                  {errors.account_balance.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="transaction_type" className="text-sm">
                Transaction Type
              </label>
              <input
                type="text"
                id="transaction_type"
                placeholder="Enter Transaction Type"
                className="input w-full"
                readOnly
                {...register("transaction_type")}
              />
              {errors.transaction_type && (
                <p className="text-red-500 text-sm">
                  {errors.transaction_type.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm">
                Description
              </label>
              <input
                type="text"
                id="description"
                placeholder="(e.g) Transfer of..."
                className="input w-full"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="time" className="text-sm">
                Time/ Date
              </label>
              <input
                type="text"
                id="time"
                placeholder="Enter Time/ Date"
                className="input w-full"
                value={new Date().toLocaleString()}
                readOnly
              />
            </div>
          </div>
          <button
            disabled={isLoading}
            type="submit"
            className="btn bg-gradient-1 text-white w-full h-10 rounded-md"
          >
            {isLoading ? "Debiting..." : "Debit"}
          </button>
        </form>
      </Container>
    </Wrapper>
  );
};

export default DebitAccount;
