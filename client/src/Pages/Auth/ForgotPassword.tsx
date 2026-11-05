import { MainLayout } from "@/Layouts";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, MailCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/Stores";
import { toApiError } from "@/Libs/api";

const schema = z.object({ email: z.string().email({ message: "Invalid email address" }) });

const ForgotPassword = () => {
  const { forgotPassword, isLoading } = useAuthStore();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: z.infer<typeof schema>) => {
    try {
      await forgotPassword(email);
      setSentTo(email);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  return (
    <MainLayout>
      <div className="layout my-10 bg-secondary p-6 rounded-lg border border-line max-w-md">
        <div className="space-y-1 text-center border-b border-line pb-4">
          <h1 className="text-2xl font-sora font-bold">Forgot password</h1>
          <p className="text-muted text-sm">Enter your email and we will send you a link to set a new password.</p>
        </div>

        {sentTo ? (
          <div className="mt-6 space-y-3 text-center">
            <MailCheck size={40} className="mx-auto text-green-600" />
            <p className="text-sm text-muted">
              If <strong>{sentTo}</strong> is registered, a reset link is on its way. It expires in about 45
              minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-muted text-sm">
                Email Address
              </label>
              <input type="email" id="email" placeholder="Enter your email" className="input" {...register("email")} />
              {errors.email && <p className="text-xs text-red-500 pl-1">{errors.email.message}</p>}
            </div>
            <button disabled={isLoading} type="submit" className="btn bg-dark text-white w-full h-10 rounded-lg">
              {isLoading ? <Loader className="animate-spin" /> : "Send reset link"}
            </button>
          </form>
        )}

        <p className="text-sm text-muted text-center mt-6">
          Back to{" "}
          <Link to="/" className="text-primary font-sora">
            Login
          </Link>
        </p>
      </div>
    </MainLayout>
  );
};

export default ForgotPassword;
