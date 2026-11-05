import { Container, UserDetails } from "@/Components/Dashboard";
import { DashboardLayout } from "@/Layouts";
import { formatNumber } from "@/Utils/formatNumber";
import { useAuthStore, useFinanceStore } from "@/Stores";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transferSchema } from "@/Schemas/transferSchema";
import { z } from "zod";
import { toast } from "sonner";
import { Loader } from "lucide-react";
const Transfer = () => {
  const { user: userData } = useAuthStore();
  const { transfer, isLoading } = useFinanceStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof transferSchema>>({
    resolver: zodResolver(transferSchema),
  });

  // The PIN, balance and account-status checks and the debit itself all happen on the server.
  const onSubmit = (data: z.infer<typeof transferSchema>) => {
    toast.promise(
      transfer({
        amount: Number(data.amount),
        pin: data.transaction_pin,
        description: `Transfer of ${userData?.currency}${formatNumber(
          Number(data.amount)
        )} to ${data.account_name}. Your account will be debited with ${
          userData?.currency
        } ${formatNumber(Number(data.amount))}`,
        recipient: {
          accountName: data.account_name,
          accountNumber: data.account_number,
          bankName: data.bank_name,
          bankAddress: data.bank_address,
          swiftCode: data.swift_code,
          routingNumber: data.routing_number,
        },
      }),
      {
        loading: "Transferring funds...",
        success: () => {
          reset();
          return "Funds transfer request sent";
        },
        error: (error: Error) => error.message,
      }
    );
  };

  if (!userData) {
    return <div className="layout center min-h-[calc(100vh-100px)]">
      <Loader className="animate-spin" /> Preparing your account...
    </div>
  }
  return (
    <DashboardLayout title="Funds Transfer">
      <UserDetails userData={userData} /> 

      <Container title="Quick Funds Transfer">
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
                type="number"
                id="account_number"
                placeholder="Enter Beneficiary Account Number"
                className="input w-full"
                {...register("account_number")}
              />
              {errors.account_number && (
                <p className="text-red-500 text-sm">
                  {errors.account_number.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="bank_name" className="text-sm">
                Bank Name
              </label>
              <input
                type="text"
                id="bank_name"
                placeholder="Enter Beneficiary Bank Name"
                className="input w-full"
                {...register("bank_name")}
              />
              {errors.bank_name && (
                <p className="text-red-500 text-sm">
                  {errors.bank_name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm">
                Bank Address
              </label>
              <input
                type="text"
                id="address"
                placeholder="Enter Beneficiary Bank Address"
                className="input w-full"
                {...register("bank_address")}
              />
              {errors.bank_address && (
                <p className="text-red-500 text-sm">
                  {errors.bank_address.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="swift_code" className="text-sm">
                Swift Code
              </label>
              <input
                type="text"
                id="swift_code"
                placeholder="Enter Swift Code"
                className="input w-full"
                {...register("swift_code")}
              />
              {errors.swift_code && (
                <p className="text-red-500 text-sm">
                  {errors.swift_code.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="routing_number" className="text-sm">
                Routing Number/ IBAN
              </label>
              <input
                type="text"
                id="routing_number"
                placeholder="Enter Routing Number/ IBAN"
                className="input w-full"
                {...register("routing_number")}
              />
              {errors.routing_number && (
                <p className="text-red-500 text-sm">
                  {errors.routing_number.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm">
                Amount
              </label>
              <input
                type="number"
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
              <label htmlFor="transaction_pin" className="text-sm">
                Transaction Pin
              </label>
              <input
                type="number"
                id="transaction_pin"
                placeholder="Enter 4 Digit Transaction Pin"
                className="input w-full"
                {...register("transaction_pin")}
              />
              {errors.transaction_pin && (
                <p className="text-red-500 text-sm">
                  {errors.transaction_pin.message}
                </p>
              )}
            </div>
          </div>
          <button
            disabled={isLoading}
            type="submit"
            className="btn bg-dark text-white w-full h-10 rounded-md"
          >
            {isLoading ? "Transferring..." : "Transfer"}
          </button>
        </form>
      </Container>
    </DashboardLayout>
  );
};

export default Transfer;
