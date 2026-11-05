import { useAuthStore } from "@/Stores";
import { Loader } from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";

/** Real guard: needs an admin session that also passed the passcode step (enforced again by the API). */
const ProtectedRoute = () => {
  const { user, passcodeVerified, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div className="h-screen center gap-2">
        <Loader className="animate-spin" /> Loading...
      </div>
    );
  }
  return user && user.role === "admin" && passcodeVerified ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
