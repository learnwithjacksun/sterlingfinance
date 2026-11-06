import { MainLayout } from "@/Layouts";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginSchema } from "@/Schemas/loginSchema";
import { useAuthStore } from "@/Stores";
import { toApiError } from "@/Libs/api";
import { toast } from "sonner";

const Login = () => {
  const { login: loginUser, isLoading, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      await loginUser(data);
      toast.success("Logged in successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  return (
    <>
      <MainLayout>
        <div className="layout my-10 bg-secondary p-6 rounded-lg border border-line">
          <div className="space-y-1 text-center border-b border-line pb-4">
            <h1 className="text-2xl font-sora font-bold">Welcome Back</h1>
            <p className="text-muted text-sm">
              Please enter your details to login to your Sterling Holdings
              account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-muted text-sm">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="input"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500 pl-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm text-muted">
                Password
              </label>
              <div className="relative flex items-center justify-between gap-2">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Minimum 8 characters"
                  className="input flex-1"
                  autoComplete="current-password"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-xs absolute right-2 center"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 pl-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Link
                to="/forgot-password"
                className="text-sm underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              disabled={isLoading}
              type="submit"
              className="btn bg-dark text-white w-full h-10 rounded-lg"
            >
              {isLoading ? <Loader className="animate-spin" /> : "Login"}
            </button>
          </form>

          <p className="text-sm text-muted text-center mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-sora">
              Register
            </Link>
          </p>
        </div>
      </MainLayout>
    </>
  );
};

export default Login;
