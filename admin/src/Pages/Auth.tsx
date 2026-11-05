import { useState } from "react";
import { Loader } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuthStore } from "@/Stores";
import { toApiError } from "@/Libs/api";
import { toast } from "sonner";

// Two steps: 1) admin email + password, 2) the admin passcode (verified by the server).
const Auth = () => {
  const { user, passcodeVerified, isCheckingAuth, isLoading, login, verifyPasscode, logout } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  if (isCheckingAuth) {
    return (
      <div className="center h-screen gap-2">
        <Loader className="animate-spin" /> Loading...
      </div>
    );
  }

  if (user && passcodeVerified) return <Navigate to="/dashboard" replace />;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }
    try {
      await login(email, password);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  const handlePasscode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!code) {
      toast.error("Passcode is required");
      return;
    }
    try {
      await verifyPasscode(code);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  return (
    <div className="center h-screen">
      <div className="max-w-md w-[90%]">
        <div className="text-center border-b border-line pb-4">
          <img src="/logo.png" alt="Logo" width={50} height={50} className="mx-auto" />
          <h2 className="text-2xl font-sora font-bold">Admin Panel</h2>
          <p className="text-sm text-muted">Welcome to True Mark Financial Bank Admin Panel</p>
        </div>

        {!user ? (
          <form onSubmit={handleLogin} className="mt-10">
            <div className="mb-4">
              <label htmlFor="email" className="block mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                autoComplete="username"
                placeholder="Enter admin email"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                autoComplete="current-password"
                placeholder="Enter password"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Link to="/forgot-password" className="text-sm underline block mb-4">
              Forgot password?
            </Link>
            <button type="submit" disabled={isLoading} className="w-full h-10 bg-dark text-white rounded-md">
              {isLoading ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasscode} className="mt-10">
            <p className="text-sm text-muted mb-4">
              Signed in as <strong>{user.email}</strong>. Enter the admin passcode to continue.
            </p>
            <div className="mb-4">
              <label htmlFor="passcode" className="block mb-2">
                Passcode
              </label>
              <input
                type="password"
                id="passcode"
                autoComplete="off"
                placeholder="Enter admin passcode"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <button type="submit" disabled={isLoading} className="w-full h-10 bg-dark text-white rounded-md">
              {isLoading ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : "Login"}
            </button>
            <button type="button" onClick={() => logout()} className="w-full mt-3 text-sm underline">
              Use a different account
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
