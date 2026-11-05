import { Container } from "@/Components/Dashboard";
import { Wrapper } from "@/Layouts";
import { useFinanceStore } from "@/Stores";
import { formatDate } from "@/Utils/formatDate";
import { formatNumber } from "@/Utils/formatNumber";
import type { AdminTransaction } from "@/Types/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Modal } from "@/Components/UI";
import { toast } from "sonner";
import { ChevronDown, Loader } from "lucide-react";
import { useUser } from "@/Hooks";

const ViewTransaction = () => {
  const { id, txId } = useParams();
  const { user: userData } = useUser(id);
  const { updateTransaction, getTransaction, isLoading } = useFinanceStore();
  const [transaction, setTransaction] = useState<AdminTransaction | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState<string>("pending");
  const currency = userData?.currency ?? "";

  // Loaded from the URL (not router state), so the page survives a refresh.
  useEffect(() => {
    if (!txId) return;
    getTransaction(txId)
      .then((t) => {
        setTransaction(t);
        setStatus(t.status);
      })
      .catch((e: Error) => setLoadError(e.message));
  }, [txId, getTransaction]);

  const handleUpdateStatus = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    toast.promise(updateTransaction(transaction?.id, status), {
      loading: "Updating status...",
      success: (updated) => {
        setTransaction((t) => (t ? { ...t, status: updated.status } : t));
        setShowModal(false);
        return transaction?.type === "debit" && updated.status === "failed"
          ? "Status updated and the debit was refunded"
          : "Status updated successfully";
      },
      error: (err: Error) => err.message || "Failed to update status",
    });
  };

  if (loadError) {
    return (
      <Wrapper userData={userData}>
        <p className="text-red-500">{loadError}</p>
      </Wrapper>
    );
  }

  return (
    <>
      <Wrapper userData={userData}>
        <Container title="Account Overview">
          <div className="col-span-2">
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
              <div className="rounded-lg space-y-1">
                <p className="text-xs text-muted">Account Name</p>
                <h3 className="text-sm py-3 px-2 bg-foreground border border-line rounded-md font-medium">
                  {userData?.name}
                </h3>
              </div>
              <div className="rounded-lg space-y-1">
                <p className="text-xs text-muted">Account Number</p>
                <h3 className="text-sm py-3 px-2 bg-foreground border border-line rounded-md font-medium">
                  {userData?.accountNumber}
                </h3>
              </div>
              <div className=" rounded-lg space-y-1">
                <p className="text-xs text-muted">Amount</p>
                <h3 className="text-sm py-3 px-2 bg-foreground border border-line rounded-md line-clamp-1 font-medium">
                  {transaction ? `${currency}${formatNumber(transaction.amount)}` : ""}
                </h3>
              </div>
              <div className=" rounded-lg space-y-1">
                <p className="text-xs text-muted">Account Balance</p>
                <h3 className="text-sm line-clamp-1 font-medium py-3 px-2 bg-foreground border border-line rounded-md">
                  {userData ? `${currency}${formatNumber(userData.balance)}` : ""}
                </h3>
              </div>
              <div className=" rounded-lg space-y-1">
                <p className="text-xs text-muted">Transaction Type</p>
                <h3 className="text-sm line-clamp-1 font-medium py-3 px-2 bg-foreground border border-line rounded-md">
                  {transaction?.type}
                </h3>
              </div>
              <div className=" rounded-lg space-y-1">
                <p className="text-xs text-muted">Transaction Status</p>
                <h3 className="text-sm line-clamp-1 font-medium py-3 px-2 bg-foreground border border-line rounded-md">
                  {transaction?.status}
                </h3>
              </div>

              <div className=" rounded-lg space-y-1">
                <p className="text-xs text-muted">Reference</p>
                <h3 className="text-sm line-clamp-1 font-medium py-3 px-2 bg-foreground border border-line rounded-md">
                  {transaction?.reference}
                </h3>
              </div>
              <div className=" rounded-lg space-y-1">
                <p className="text-xs text-muted">Description</p>
                <h3 className="text-sm line-clamp-1 font-medium py-3 px-2 bg-foreground border border-line rounded-md">
                  {transaction?.description}
                </h3>
              </div>
              <div className=" rounded-lg space-y-1">
                <p className="text-xs text-muted">Date</p>
                <h3 className="text-sm line-clamp-1 font-medium py-3 px-2 bg-foreground border border-line rounded-md">
                  {formatDate(transaction?.createdAt)}
                </h3>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={isLoading || !transaction}
            className="bg-primary text-sm text-white px-4 py-2 rounded-md"
          >
            {isLoading ? (
              <Loader className="animate-spin" />
            ) : (
              "Update Status"
            )}
          </button>
        </Container>
      </Wrapper>

      {showModal && (
        <Modal
          title="Transaction Details"
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        >
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">
                {transaction?.description}
              </p>
            </div>
            {transaction?.type === "debit" && (
              <p className="text-xs text-gray-500">
                Marking a debit as <strong>failed</strong> refunds the amount to the user's balance. Moving it
                back out of failed charges it again.
              </p>
            )}
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div className="relative">
                <select
                  name="status"
                  id="status"
                  className="input w-full appearance-none"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <ChevronDown
                  size={20}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full h-10 rounded-lg"
              >
                {isLoading ? (
                  <Loader className="animate-spin" />
                ) : (
                  "Update Status"
                )}
              </button>
            </form>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ViewTransaction;
