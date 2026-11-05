import { useState } from "react";
import { Loader, MailCheck } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/Stores";
import { toApiError } from "@/Libs/api";

const Shell = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="center h-screen">
    <div className="max-w-md w-[90%]">
      <div className="text-center border-b border-line pb-4">
        <img src="/logo.png" alt="Logo" width={50} height={50} className="mx-auto" />
        <h2 className="text-2xl font-sora font-bold">{title}</h2>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  </div>
);

export const ForgotPassword = () => {
  const { forgotPassword, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  return (
    <Shell title="Forgot password">
      {sent ? (
        <div className="text-center space-y-3">
          <MailCheck size={40} className="mx-auto text-green-600" />
          <p className="text-sm text-muted">If that email is registered, a reset link is on its way.</p>
        </div>
      ) : (
        <form onSubmit={submit}>
          <label htmlFor="email" className="block mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" disabled={isLoading} className="w-full h-10 bg-dark text-white rounded-md">
            {isLoading ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : "Send reset link"}
          </button>
        </form>
      )}
      <Link to="/" className="block text-center text-sm underline mt-6">
        Back to login
      </Link>
    </Shell>
  );
};

export const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const { resetPassword, isLoading } = useAuthStore();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [expired, setExpired] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (password.length < 8) return void toast.error("Password must be at least 8 characters");
    if (password !== confirm) return void toast.error("Passwords do not match");
    try {
      await resetPassword(token, password);
      toast.success("Password updated. Enter the admin passcode to continue.");
      navigate("/");
    } catch (error) {
      const err = toApiError(error);
      if (err.code === "INVALID_RESET_TOKEN") setExpired(true);
      else toast.error(err.message);
    }
  };

  if (!token || expired) {
    return (
      <Shell title="Set a new password">
        <p className="text-sm text-muted text-center mb-4">This reset link is invalid or has expired.</p>
        <Link to="/forgot-password" className="block text-center text-sm underline">
          Request a new link
        </Link>
      </Shell>
    );
  }

  return (
    <Shell title="Set a new password">
      <form onSubmit={submit}>
        <label htmlFor="password" className="block mb-2">
          New password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="confirm" className="block mb-2">
          Confirm password
        </label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <button type="submit" disabled={isLoading} className="w-full h-10 bg-dark text-white rounded-md">
          {isLoading ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : "Save password"}
        </button>
      </form>
    </Shell>
  );
};
