import { useAdminStore } from "@/Stores";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/Layouts";
import { Container } from "@/Components/Dashboard";
import { toast } from "sonner";

import { UserDetails } from "@/Components/Admin";
import { formatDate } from "@/Utils/formatDate";
import { useUser } from "@/Hooks";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="rounded-lg space-y-1">
    <p className="text-xs text-muted">{label}</p>
    <h3 className="text-sm line-clamp-1 font-medium py-3 px-2 bg-foreground border border-line rounded-md">
      {children}
    </h3>
  </div>
);

const Profile = () => {
  const { id } = useParams();
  const { user: userData, error } = useUser(id);
  const { activateAccount, deactivateAccount, sendResetEmail, isUpdating } = useAdminStore();

  const avatar =
    userData?.avatar ||
    `https://api.dicebear.com/9.x/initials/svg?seed=${userData?.name}`;

  const handleActivateAccount = () => {
    toast.promise(activateAccount(id), {
      loading: "Activating account...",
      success: "Account activated successfully",
      error: (e: Error) => e.message || "Failed to activate account",
    });
  };

  const handleDeactivateAccount = () => {
    toast.promise(deactivateAccount(id), {
      loading: "Deactivating account...",
      success: "Account deactivated successfully",
      error: (e: Error) => e.message || "Failed to deactivate account",
    });
  };

  const handleSendReset = () => {
    if (!id) return;
    toast.promise(sendResetEmail(id), {
      loading: "Sending reset email...",
      success: `Password reset email sent to ${userData?.email}`,
      error: (e: Error) => e.message || "Failed to send email",
    });
  };

  if (error) {
    return (
      <DashboardLayout>
        <p className="text-red-500">{error}</p>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout>
        <UserDetails userData={userData} />

        <div className="flex gap-6 flex-wrap md:flex-nowrap">
          <Container title="Account Overview">
            <div className="col-span-2">
              <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                <Field label="Account Name">{userData?.name}</Field>
                <Field label="Account Number">{userData?.accountNumber}</Field>
                <Field label="Email">{userData?.email}</Field>
                <Field label="Phone Number">{userData?.phone}</Field>
                {/* Passwords and PINs are stored hashed and can no longer be displayed. */}
                <Field label="Password">Set (hidden)</Field>
                <Field label="Transaction Pin">{userData?.hasPin ? "Set (hidden)" : "Not set"}</Field>
                <Field label="Nationality">{userData?.country}</Field>
                <Field label="Date Created">{formatDate(userData?.createdAt)}</Field>
              </div>
              <button
                onClick={handleSendReset}
                disabled={!userData}
                className="btn mt-6 bg-gradient-1 text-white px-4 h-10 rounded-md text-sm"
              >
                Email password reset link
              </button>
            </div>
          </Container>

          <div className="center flex-col bg-gradient-to-br from-gradient-1 to-gradient-2 p-4 min-h-[400px] max-h-[400px] md:min-w-[280px] min-w-full rounded-lg space-y-8">
            <div className="w-40 h-40 border-6 border-white rounded-full overflow-hidden">
              <img
                src={avatar}
                alt="avatar"
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <div className="text-center text-white space-y-4">
              <p className="text-xs">You are viewing!</p>
              <p className="uppercase text-sm font-medium">{userData?.name}</p>
            </div>

            {userData?.isActive === true ? (
              <button
                onClick={handleDeactivateAccount}
                disabled={isUpdating}
                className="btn mt-4 bg-dark p-2 text-white rounded-md text-sm"
              >
                Disable Account
              </button>
            ) : (
              <button
                disabled={isUpdating}
                className="btn mt-4 bg-dark p-2 text-white rounded-md text-sm"
                onClick={handleActivateAccount}
              >
                Enable Account
              </button>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Profile;
