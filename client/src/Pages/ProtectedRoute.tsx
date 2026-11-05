import { useAuthStore } from "@/Stores";
import { Loader } from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { user, isCheckingAuth } = useAuthStore();
  return (
    <div>
      {isCheckingAuth ? (
        <div className="h-screen center gap-2">
          <Loader className="animate-spin" /> Loading...
        </div>
      ) : user ? (
        <Outlet />
      ) : (
        <Navigate to="/" />
      )}
    </div>
  );
};

export default ProtectedRoute;
