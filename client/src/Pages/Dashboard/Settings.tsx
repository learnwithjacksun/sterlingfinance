import { DashboardLayout } from "@/Layouts";
import { Container, UserDetails } from "@/Components/Dashboard";
import clsx from "clsx";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/Stores";
import { toast } from "sonner";
const updatePasswordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(8, "Password must be at least 8 characters long"),
  confirm_password: z.string().min(8, "Password must be at least 8 characters long"),
}).refine((data) => data.new_password === data.confirm_password, {
  path: ["confirm_password"],
  message: "Passwords do not match",
});

const updatePinSchema = z.object({
  current_pin: z.string().min(4, "Pin must be at least 4 digits long"),
  new_pin: z.string().min(4, "Pin must be at least 4 digits long"),
})

const Settings = () => {
  const { updatePassword, isUpdating, updatePin, user: userData } = useAuthStore();
  const { register, handleSubmit: handleSubmitPassword, reset: resetPasswordForm, formState: { errors } } = useForm<z.infer<typeof updatePasswordSchema>>({
    resolver: zodResolver(updatePasswordSchema),
  });
  const { register: registerPin, handleSubmit: handleSubmitPin, reset: resetPinForm, formState: { errors: errorsPin } } = useForm<z.infer<typeof updatePinSchema>>({
    resolver: zodResolver(updatePinSchema),
  });
  const tabs = [
    {
      label: "Change Password",
      id: "password",
    },
    {
      label: "Transaction Pin",
      id: "pin",
    },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const changePassword = (data: z.infer<typeof updatePasswordSchema>) => {
    toast.promise(updatePassword(data.current_password, data.new_password), {
      loading: "Changing password...",
      success: () => {
        resetPasswordForm();
        return "Password changed successfully";
      },
      error: (error: Error) => error.message || "Failed to change password",
    });
  }

  // The server verifies the current PIN.
  const changePin = (data: z.infer<typeof updatePinSchema>) => {
    toast.promise(updatePin(data.current_pin, data.new_pin), {
      loading: "Changing pin...",
      success: () => {
        resetPinForm();
        return "Pin changed successfully";
      },
      error: (error: Error) => error.message || "Failed to change pin",
    });
  }

  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(prev => !prev);
  }
  if (!userData) {
    return 
  }

  return (
    <DashboardLayout title="Settings">
      <UserDetails userData={userData} />
      <Container>
        <div className="flex gap-4 mb-10 border-b border-line pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={clsx(
                "text-sm capitalize px-4 py-2 rounded-sm font-medium font-sans",
                {
                  "btn-primary text-white font-sans": tab.id === activeTab,
                }
              )}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === "password" && (
            <form onSubmit={handleSubmitPassword(changePassword)} className="max-w-md space-y-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="current_password" className="text-sm text-muted">
                Current Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="current_password"
                placeholder="Enter your current password"
                className="input w-full"
                autoComplete="current-password"
                {...register("current_password")}
              />
              {errors.current_password && (
                <p className="text-xs text-red-500">{errors.current_password.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="new_password" className="text-sm text-muted">
                New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="new_password"
                placeholder="Enter your new password"
                className="input w-full"
                {...register("new_password")}
              />
              {errors.new_password && (
                <p className="text-xs text-red-500">{errors.new_password.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="confirm_password" className="text-sm text-muted">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirm_password"
                placeholder="Confirm your new password"
                className="input w-full"
                {...register("confirm_password")}
              />
              {errors.confirm_password && (
                <p className="text-xs text-red-500">{errors.confirm_password.message}</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2">
              <p className="text-xs text-primary cursor-pointer font-medium font-sora" onClick={togglePassword}>
                {showPassword ? "Hide Password" : "Show Password"}
              </p>
            </div>
            <button type="submit" disabled={isUpdating} className="btn bg-dark text-white w-full h-10 rounded-sm font-medium ">
             {isUpdating ? "Saving..." : "Save Password"}
            </button>
          </form>
        )}
        {activeTab === "pin" && (
           <form onSubmit={handleSubmitPin(changePin)} className="max-w-md space-y-4">
           <div className="flex flex-col gap-1">
             <label htmlFor="current-password" className="text-sm text-muted">
               Current Pin
             </label>
             <input
               type="number"
               id="current-password"
               placeholder="Enter your current pin"
               className="input w-full"
               {...registerPin("current_pin")}
             />
             {errorsPin.current_pin && (
               <p className="text-xs text-red-500">{errorsPin.current_pin.message}</p>
             )}
           </div>
           <div className="flex flex-col gap-1">
             <label htmlFor="new-password" className="text-sm text-muted">
               New Pin
             </label>
             <input
               type="number"
               id="new-password"
               placeholder="Enter your new pin"
               className="input w-full"
               {...registerPin("new_pin")}
             />
             {errorsPin.new_pin && (
               <p className="text-xs text-red-500">{errorsPin.new_pin.message}</p>
             )}
           </div>
          
           
           <button type="submit" disabled={isUpdating} className="btn bg-dark text-white w-full h-10 rounded-sm font-medium ">
             {isUpdating ? "Saving..." : "Save Pin"}
           </button>
         </form>
        )}
      </Container>
    </DashboardLayout>
  );
};

export default Settings;
