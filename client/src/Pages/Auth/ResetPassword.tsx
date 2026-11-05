import { MainLayout } from "@/Layouts";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/Stores";
import { toApiError } from "@/Libs/api";

const schema = z
  .object({
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords do not match" });

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const { resetPassword, isLoading } = useAuthStore();
  const [show, setShow] = useState(false);
  const [expired, setExpired] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ password }: z.infer<typeof schema>) => {
    if (!token) return;
    try {
      await resetPassword(token, password);
      toast.success("Password updated, you are now signed in");
      navigate("/dashboard");
    } catch (error) {
      const err = toApiError(error);
      if (err.code === "INVALID_RESET_TOKEN") setExpired(true);
      else toast.error(err.message);
    }
  };

  const invalid = !token || expired;

  return (
    <MainLayout>
      <div className="layout my-10 bg-secondary p-6 rounded-lg border border-line max-w-md">
        <div className="space-y-1 text-center border-b border-line pb-4">
          <h1 className="text-2xl font-sora font-bold">Set a new password</h1>
          <p className="text-muted text-sm">Choose a password you have not used before.</p>
        </div>

        {invalid ? (
          <div className="mt-6 space-y-3 text-center">
            <p className="text-sm text-muted">This reset link is invalid or has expired.</p>
            <Link to="/forgot-password" className="btn bg-dark text-white w-full h-10 rounded-lg inline-flex center">
              Request a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-muted text-sm">
                New password
              </label>
              <div className="relative flex items-center">
                <input
                  type={show ? "text" : "password"}
                  id="password"
                  placeholder="Minimum 8 characters"
                  className="input flex-1"
                  autoComplete="new-password"
                  {...register("password")}
                />
                <button type="button" onClick={() => setShow((p) => !p)} className="text-xs absolute right-2 center">
                  {show ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 pl-1">{errors.password.message}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="confirm" className="text-muted text-sm">
                Confirm password
              </label>
              <input
                type={show ? "text" : "password"}
                id="confirm"
                placeholder="Repeat your password"
                className="input"
                autoComplete="new-password"
                {...register("confirm")}
              />
              {errors.confirm && <p className="text-xs text-red-500 pl-1">{errors.confirm.message}</p>}
            </div>
            <button disabled={isLoading} type="submit" className="btn bg-dark text-white w-full h-10 rounded-lg">
              {isLoading ? <Loader className="animate-spin" /> : "Save password"}
            </button>
          </form>
        )}
      </div>
    </MainLayout>
  );
};

export default ResetPassword;
