import type { User } from "@/Types/api";
import DashboardLayout from "./DashboardLayout";
import { UserDetails } from "@/Components/Admin";
import { toast } from "sonner";
import { useAdminStore } from "@/Stores";

const Wrapper = ({
  userData,
  children,
}: {
  userData: User | undefined;
  children: React.ReactNode;
}) => {
  const { activateAccount, deactivateAccount, isUpdating } = useAdminStore();
  const avatar =
    userData?.avatar ||
    `https://api.dicebear.com/9.x/initials/svg?seed=${userData?.name}`;

  const handleActivateAccount = () => {
    toast.promise(activateAccount(userData?.id), {
      loading: "Activating account...",
      success: "Account activated successfully",
      error: (error: Error) => error.message || "Failed to activate account",
    });
  };

  const handleDeactivateAccount = () => {
    toast.promise(deactivateAccount(userData?.id), {
      loading: "Deactivating account...",
      success: "Account deactivated successfully",
      error: (error: Error) => error.message || "Failed to deactivate account",
    });
  };
  return (
    <>
      <DashboardLayout>
        <UserDetails userData={userData} />
        <div className="flex gap-6 flex-wrap md:flex-nowrap">
          {children}

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

export default Wrapper;
