import { formatNumber } from "@/Utils/formatNumber";
import type { AdminTransaction, User } from "@/Types/api";
import clsx from "clsx";
import { useFinanceStore } from "@/Stores";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const headings = [
  "Date/Time",
  "Type",
  "Description",
  "Amount",
  "Status",
  "Available Balance",
  "Action",
];

const UserTransactionItem = ({
  transactions,
  user
}: {
  transactions: AdminTransaction[] | undefined;
  user: User | undefined;
}) => {
  const { isLoading, deleteTransaction , sendSms, isSendingSms} = useFinanceStore();
  const currency = user?.currency ?? "$";

  const navigate = useNavigate();

  const handleViewTransaction = (transaction: AdminTransaction) => {
    navigate(transaction.id);
  };

  const handleDeleteTransaction = (transaction: AdminTransaction) => {
    if (!window.confirm("Delete this transaction? The user's balance will not change.")) return;
    toast.promise(deleteTransaction(transaction.id), {
      loading: "Deleting transaction...",
      success: "Transaction deleted successfully",
      error: (error: Error) => error.message || "Failed to delete transaction",
    });
  };

  const handleSendSms = (transaction: AdminTransaction) => {
    toast.promise(sendSms(transaction.id), {
      loading: "Sending SMS...",
      success: "SMS sent successfully",
      error: (error: Error) => error.message || "Failed to send SMS",
    });
  };

  return (
    <>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse border border-gray-200 shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm text-left">
              {headings.map((x) => (
                <th
                  key={x}
                  className="py-3 px-4 border-b border-gray-300 font-medium"
                >
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm text-gray-600">
            {transactions?.map((x) => (
              <tr
                key={x.id}
                className="border-b border-gray-200 hover:bg-gray-50 text-xs transition-all"
              >
                {/* Date */}
                <td className="py-3 px-4">
                  {new Date(x.createdAt).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </td>

                {/* Type */}
                <td className="py-3 px-4">
                  <div
                    className={clsx(
                      x.type === "credit" ? "text-green-500" : "text-red-500",
                      "h-8 w-8 flex items-center justify-center capitalize rounded-lg"
                    )}
                  >
                    {x.type}
                  </div>
                </td>

                {/* Description */}
                <td className="py-3 px-4 truncate max-w-xs">{x.description}</td>

                {/* Amount */}
                <td
                  className={clsx(
                    "py-3 px-4 font-semibold",
                    x.type === "credit" ? "text-main" : "text-red-500"
                  )}
                >
                  {x.type === "credit" ? "+" : "-"}{currency}{formatNumber(x.amount)}
                </td>

                {/* Status */}
                <td
                  className={clsx(
                    "py-3 px-4 capitalize font-medium",
                    x.status === "success" ? "text-green-500" : x.status === "pending" ? "text-yellow-500" : "text-red-500"
                  )}
                >
                  {x.status}
                </td>

                {/* Balance after this transaction */}
                <td className="py-3 px-4">{x.balanceAfter === undefined ? "-" : `${currency}${formatNumber(x.balanceAfter)}`}</td>

                {/* Action buttons */}
                <td className="py-3 px-4 flex md:flex-row flex-col gap-1">
                  <button
                    className=" px-3 py-1 text-xs rounded text-white bg-gradient-1 hover:bg-blue-600"
                    onClick={() => handleViewTransaction(x)}
                  >
                    View
                  </button>
                  <button
                    className="px-2 py-1 text-nowrap text-xs rounded text-white bg-gradient-1 hover:bg-green-600"
                    onClick={() => handleSendSms(x)}
                    disabled={isSendingSms}
                  >
                    {isSendingSms ? "Sending..." : "Send SMS"}
                  </button>
                  <button
                    disabled={isLoading}
                    className="px-3 py-1 text-xs rounded text-white bg-dark hover:bg-red-600"
                    onClick={() => handleDeleteTransaction(x)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!transactions || transactions.length === 0) && (
          <div className="text-center py-6 text-gray-500">
            No transactions found!
          </div>
        )}
      </div>


    </>
  );
};

export default UserTransactionItem;
