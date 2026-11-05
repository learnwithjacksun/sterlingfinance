import { DashboardLayout } from "@/Layouts";
import { Container, TransactionItem } from "@/Components/Dashboard";
import { useFinanceStore } from "@/Stores";
import { useEffect } from "react";
import { toast } from "sonner";

const Transactions = () => {
  const { transactions, fetchTransactions, loadMore, hasMore, isFetching } = useFinanceStore();

  useEffect(() => {
    fetchTransactions().catch((error: Error) => toast.error(error.message));
  }, [fetchTransactions]);

  return (
    <DashboardLayout title="Transaction History">
      <Container>
        <TransactionItem transactions={transactions} />
        {hasMore && (
          <button
            onClick={() => loadMore().catch((error: Error) => toast.error(error.message))}
            disabled={isFetching}
            className="btn bg-dark text-white h-10 px-6 rounded-md mx-auto mt-4"
          >
            {isFetching ? "Loading..." : "Load more"}
          </button>
        )}
      </Container>
    </DashboardLayout>
  );
};

export default Transactions;
