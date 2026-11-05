import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  UserCog,
  LogOut,
  Loader,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/Stores";
import { toast } from "sonner";

export const ProfileCard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout: logoutUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const userData = {
    name: user?.name,
    email: user?.email,
    avatar: user?.avatar,
    isAdmin: user?.isAdmin,
  };



  const avatar =
    userData.avatar ||
    `https://api.dicebear.com/9.x/initials/svg?seed=${userData.name}`;

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    toast.promise(logoutUser, {
      loading: "Logging out...",
      success: () => {
        navigate("/");
        return "Logged out successfully";
      },
      error: (error) => {
        return error.message;
      },
    });
  };

  return (
    <div className="relative " ref={dropdownRef}>
      <div
        onClick={toggleDropdown}
        className="flex items-center gap-2 cursor-pointer"
      >
        <p className="text-sm font-sora font-medium md:block hidden">
          {userData.name}
        </p>

        <div className="bg-primary rounded-full w-10 h-10 text-white text-lg font-sora font-medium center">
          <img
            src={avatar}
            alt="avatar"
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <ChevronDown size={20} className="ml-auto hidden md:block" />
      </div>

      {isOpen && (
        <div className="absolute top-full md:right-0 -right-[100%] bg-secondary border border-line shadow-md rounded-lg p-2 w-[250px]">
          <div className="md:hidden bg-foreground rounded-md p-2">
            <p className="text-sm font-sora font-medium">{userData.name}</p>
            <span className="text-xs font-medium text-muted">
              {userData?.email}
            </span>
          </div>
          <ul className="space-y-2 my-2">
            <li>
              <Link
                to="/profile"
                className="flex items-center gap-2 p-2 text-sm rounded-md hover:bg-foreground"
              >
                <UserCog size={20} />
                <span>Profile</span>
              </Link>
            </li>
           
            <li>
              <div
                onClick={handleLogout}
                className="flex btn btn-primary items-center gap-2 p-2 text-sm rounded-lg"
              >
                {isLoading ? (
                  <Loader size={20} className="animate-spin" />
                ) : (
                  <LogOut size={20} />
                )}
                <span>Logout</span>
              </div>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
