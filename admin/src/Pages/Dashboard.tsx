import { Fragment, useEffect, useState } from "react";
import { Container } from "@/Components/Dashboard";
import { DashboardLayout } from "@/Layouts";
import { useAdminStore } from "@/Stores";
import { formatDate } from "@/Utils/formatDate";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PAGE_SIZE = 25;
const REFRESH_MS = 30_000;

const Dashboard = () => {
  const {
    users,
    total,
    page,
    search,
    isLoading,
    fetchUsers,
    deactivateAccount,
    activateAccount,
    isUpdating,
    deleteUser,
    isDeletingUser,
  } = useAdminStore();
  const headings = ["Member", "Email", "Status", "Created", "Action"];
  const gridTemplateColumns = headings.length;
  const [query, setQuery] = useState(search);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Initial load, then quiet polling.
  useEffect(() => {
    fetchUsers().catch((e: Error) => toast.error(e.message));
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") fetchUsers({ silent: true }).catch(() => undefined);
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [fetchUsers]);

  const getInitials = (name: string) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "?";
  };

  const navigate = useNavigate();

  const handleManage = (id: string) => {
    navigate(`/user/${id}/profile`);
  };

  const handleToggle = (id: string, isActive: boolean) => {
    toast.promise(isActive ? deactivateAccount(id) : activateAccount(id), {
      loading: isActive ? "Disabling account..." : "Activating account...",
      success: isActive ? "Account disabled" : "Account activated",
      error: (e: Error) => e.message,
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Permanently delete ${name}, along with all their transactions? This cannot be undone.`)) return;
    toast.promise(deleteUser(id), {
      loading: "Deleting user...",
      success: "User deleted successfully",
      error: (e: Error) => e.message,
    });
  };

  const runSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers({ page: 1, search: query.trim() }).catch((err: Error) => toast.error(err.message));
  };

  return (
    <DashboardLayout title="User Management" isDashboard={true}>
      <Container>
        <form onSubmit={runSearch} className="flex gap-2 mb-4">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, phone or account number"
            className="input flex-1"
          />
          <button type="submit" className="btn bg-dark text-white px-4 rounded-md text-sm">
            Search
          </button>
        </form>

        <div
          style={{ gridTemplateColumns: `repeat(${gridTemplateColumns}, 1fr)` }}
          className="grid overflow-x-auto hide-scrollbar space-y-4"
        >
          {/* Table Headers */}
          {headings.map((x) => (
            <div key={x} className="text-left font-semibold text-gray-700 min-w-[150px] text-sm">
              {x}
            </div>
          ))}

          {/* User Data */}
          {users.map((user) => (
            <Fragment key={user.id}>
              <div className="flex items-center h-full gap-3 min-w-[150px]">
                {user.avatar ? (
                  <div className="min-w-10 w-10 h-10 center overflow-hidden">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                  </div>
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center font-sora font-medium bg-gray-300 text-xs rounded-full text-gray-700">
                    {getInitials(user.name)}
                  </div>
                )}
                <span className="text-xs font-medium">{user.name}</span>
              </div>

              {/* Email */}
              <div className="min-w-[100px] h-full text-xs flex items-center text-gradient-1">
                {user.email}
              </div>

              {/* Status with dynamic styling */}
              <div
                className={`min-w-[100px] h-full text-xs font-medium flex items-center ${
                  user.isActive ? "text-white" : "text-red-500"
                }`}
              >
                <span className={`text-xs font-medium center inline-block  ${
                  user.isActive ? "text-white bg-green-600 rounded-md px-2 py-1" : "text-white bg-black rounded-md px-2 py-1"
                }`}>{user.isActive ? "Active" : "Inactive"}</span>
              </div>

              {/* Created Date */}
              <div className="min-w-[90px] h-full text-xs flex items-center text-gray-600">
                {formatDate(user.createdAt)}
              </div>

              {/* Actions */}
              <div className="min-w-[150px] flex md:items-center md:flex-row flex-col gap-2 ">
                <div
                  onClick={() => handleManage(user.id)}
                  className="px-1 h-6 center cursor-pointer bg-gradient-1 text-nowrap hover:bg-gradient-2 rounded-sm text-[11px] text-white font-medium transition"
                >
                  Go to Profile
                </div>
                <div
                  onClick={() => handleToggle(user.id, user.isActive)}
                  className={`px-1 h-6 center cursor-pointer rounded-sm text-white text-[11px] font-medium transition ${
                    user.isActive ? "bg-dark hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {isUpdating ? "Loading..." : user.isActive ? "Disable" : "Activate"}
                </div>
                <div
                  onClick={() => handleDelete(user.id, user.name)}
                  className="px-3 h-7 center cursor-pointer bg-gray-500 hover:bg-gray-600 rounded-md text-xs text-white font-medium transition"
                >
                  {isDeletingUser ? "Loading..." : "Delete"}
                </div>
              </div>
            </Fragment>
          ))}
        </div>

        {!isLoading && users.length === 0 && (
          <div className="text-center py-6 text-gray-500">No users found.</div>
        )}

        <div className="flex items-center justify-between mt-6 text-sm">
          <span className="text-gray-500">
            {total} user{total === 1 ? "" : "s"} · page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1 || isLoading}
              onClick={() => fetchUsers({ page: page - 1 })}
              className="btn bg-dark text-white px-3 h-8 rounded-md disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages || isLoading}
              onClick={() => fetchUsers({ page: page + 1 })}
              className="btn bg-dark text-white px-3 h-8 rounded-md disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </Container>
    </DashboardLayout>
  );
};

export default Dashboard;
