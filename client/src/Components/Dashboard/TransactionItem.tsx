import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatNumber } from "@/Utils/formatNumber";
import type { ApiTransaction } from "@/Types/api";
import clsx from "clsx";


const headings = ["S/N", "Type", "Amount", "Description", "Status", "Date"];

const TransactionItem = ({ transactions }: { transactions: ApiTransaction[] }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse border border-gray-200 shadow-md rounded-lg">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-left">
            {headings.map((x) => (
              <th key={x} className="py-3 px-4 border-b border-gray-300 font-medium">
                {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm text-gray-600">
          {transactions.map((x, y) => (
            <tr
              key={x.id}
              className="border-b border-gray-200 hover:bg-gray-50 transition-all"
            >
              <td className="py-3 px-4">{y + 1}</td>
              <td className="py-3 px-4">
                <div
                  className={clsx(
                    x.type === "credit"
                      ? " text-green-500"
                      : " text-red-500",
                    "h-8 w-8 flex items-center justify-center rounded-lg"
                  )}
                >
                  {x.type === "credit" ? <ArrowUpRight /> : <ArrowDownRight />}
                </div>
              </td>
              <td className={clsx("py-3 px-4 font-semibold", x.type === "credit" ? "text-main" : "text-red-500")}>{x.type === "credit" ? "+" : "-"}${formatNumber(x.amount)}</td>
              <td className="py-3 px-4 truncate max-w-xs">{x.description}</td>
              <td className="py-3 px-4">
                <span
                  className={clsx(
                    x.status === "success"
                      ? "text-green-500"
                      : x.status === "pending"
                      ? "text-yellow-500"
                      : "text-red-500",
                    "capitalize font-medium"
                  )}
                >
                  {x.status}
                </span>
              </td>
              <td className="py-3 px-4">
                {new Date(x.createdAt).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {(!transactions || transactions.length === 0) && (
        <div className="text-center py-6 text-gray-500">No transactions found!</div>
      )}
    </div>
  );
};

export default TransactionItem;
