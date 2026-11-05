import { UserRound } from "lucide-react";
import { useAuthStore } from "@/Stores";

export const ProfileCard = () => {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="relative ">
      <div className="flex items-center gap-2 cursor-pointer">
        <p className="text-sm font-sora font-medium md:block hidden">
          Welcome, {user?.name ?? "Admin"}
        </p>

        <div className="bg-primary rounded-full w-10 h-10 text-white text-lg font-sora font-medium center">
          <UserRound size={20} />
        </div>
      </div>
    </div>
  );
};
