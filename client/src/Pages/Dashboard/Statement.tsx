import { DashboardLayout } from "@/Layouts";
import { Container, TransactionItem, UserDetails } from "@/Components/Dashboard";
import { useFinanceStore, useAuthStore } from "@/Stores";
import { useEffect } from "react";
import { toast } from "sonner";

const Statement = () => {
  const { transactions, fetchTransactions, loadMore, hasMore, isFetching } = useFinanceStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchTransactions().catch((error: Error) => toast.error(error.message));
  }, [fetchTransactions]);

  if (!user) {
    return null;
  }

  return (
    <>
      <DashboardLayout title="AccountStatement">
       <UserDetails userData={user} />

        <Container title="Transaction History">
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
    </>
  );
};

export default Statement;
