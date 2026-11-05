import { DashboardLayout } from "@/Layouts";

import { Container } from "@/Components/Dashboard";
import { UserDetails, UserTransactionItem } from "@/Components/Admin";
import { useFinanceStore } from "@/Stores";
import { useParams } from "react-router-dom";
import { useUser } from "@/Hooks";
import { useEffect } from "react";
import { toast } from "sonner";

const Transactions = () => {
  const { id } = useParams();
  const { user } = useUser(id);
  const { transactions, fetchUserTransactions, hasMore, isFetching, clear } = useFinanceStore();

  useEffect(() => {
    if (!id) return;
    clear();
    fetchUserTransactions(id).catch((e: Error) => toast.error(e.message));
  }, [id, fetchUserTransactions, clear]);

  return (
    <>
      <DashboardLayout title="Transactions History">
        <UserDetails userData={user} />
        <Container title={`${user?.name ?? ""} Transactions`}>
          <UserTransactionItem transactions={transactions} user={user} />
          {hasMore && id && (
            <button
              onClick={() => fetchUserTransactions(id, { more: true }).catch((e: Error) => toast.error(e.message))}
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

export default Transactions;
