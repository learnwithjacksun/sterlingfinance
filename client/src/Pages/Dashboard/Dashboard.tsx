import { DashboardLayout } from "@/Layouts";
import { MessageSquareWarning, Loader} from "lucide-react";
import { TickerTape } from "react-ts-tradingview-widgets";
import { Container, TransactionItem, UserDetails } from "@/Components/Dashboard";
import { useAuthStore, useFinanceStore } from "@/Stores";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Dashboard = () => {
  const { user } = useAuthStore();
  const { transactions, fetchTransactions } = useFinanceStore();
  const recentTransactions = transactions.slice(0, 3);

  useEffect(() => {
    fetchTransactions().catch((error: Error) => toast.error(error.message));
  }, [fetchTransactions]);

  if (!user) {
    return <div className="layout center min-h-[calc(100vh-100px)]">
      <Loader className="animate-spin" /> Preparing your account...
    </div>
  }

  if (!user.isActive) {
    return (
        <main className="layout center min-h-[calc(100vh-100px)]">
          <div className="w-full max-w-[400px] bg-secondary p-4 rounded-lg space-y-4 text-center">
            <div className="center h-20 w-20 mx-auto bg-yellow-500/10 rounded-full">
              <MessageSquareWarning size={40} className="text-yellow-500" />
            </div>
              <h1 className="text-2xl font-bold">Account is not active</h1>
            <div className="space-y-2">
              <p className="text-muted border-b border-line pb-2">If you are a new user, your account will be activated within 24 hours of registration. We are setting up a new account verification system to ensure the security of your account.</p>
              <p className="text-muted">However, if you think this is an error, or you went against our terms of service, please contact support</p>
            </div>
            <Link
              to="/support"
              className="flex btn btn-primary px-4 py-2 rounded-lg items-center gap-2"
            >
              <span>Contact Support</span>
            </Link>
          </div>
        </main>
    );
  }
  return (
    <>
      <DashboardLayout isDashboard={true}>
        <TickerTape colorTheme="light" isTransparent={true} />
        <UserDetails userData={user} />

        <Container title="Recent Transactions">
          <TransactionItem transactions={recentTransactions} />
        </Container>
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
