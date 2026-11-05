import { Wrapper } from "@/Layouts";
import { useNavigate, useParams } from "react-router-dom";
import { useFinanceStore } from "@/Stores";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Container } from "@/Components/Dashboard";
import { fundAccountSchema } from "@/Schemas/schemas";
import { formatNumber } from "@/Utils/formatNumber";
import { useUser } from "@/Hooks";
import { useEffect } from "react";
import { toast } from "sonner";

export type FundAccountForm = z.infer<typeof fundAccountSchema>;

const FundAccount = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser(id);

  const { fund, isLoading } = useFinanceStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FundAccountForm>({
    resolver: zodResolver(fundAccountSchema),
    defaultValues: { transaction_type: "credit" },
  });

  // Fill the read-only fields once the user has loaded (and after the balance changes).
  useEffect(() => {
    if (!user) return;
    reset({
      account_name: user.name,
      account_number: user.accountNumber,
      account_balance: `${user.currency} ${formatNumber(user.balance)}`,
      transaction_type: "credit",
      amount: "",
      description: "",
    });
  }, [user?.id, user?.balance, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  // The new balance is calculated by the server, atomically with the ledger entry.
  const onSubmit = (data: FundAccountForm) => {
    if (!user?.id) return;
    toast.promise(fund(user.id, { amount: Number(data.amount), description: data.description }), {
      loading: "Funding account...",
      success: () => {
        navigate(`/user/${user.id}/transactions`);
        return "Account funded successfully";
      },
      error: (e: Error) => e.message || "Failed to fund account",
    });
  };

  return (
    <Wrapper userData={user}>
      <Container title="Funds Account">
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
            {isLoading ? "Funding..." : "Fund"}
          </button>
        </form>
      </Container>
    </Wrapper>
  );
};

export default FundAccount;
