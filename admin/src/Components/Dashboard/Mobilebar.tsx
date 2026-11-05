import { motion } from "framer-motion";
import { NavLink, useMatch, useNavigate } from "react-router-dom";
import {
  LogOut,
  X,
  Loader,
  LayoutDashboard,
  UserPlus,
  Settings,
  User,
  CreditCard,
  History,
  QrCode,
  Pencil,
} from "lucide-react";
import { useEffect } from "react";
import { useAuthStore } from "@/Stores";

interface MobilebarProps {
  onClose: () => void;
  isOpen: boolean;
}

const Mobilebar = ({ onClose, isOpen }: MobilebarProps) => {
  const userId = useMatch("/user/:id/*")?.params.id;
  const { logout: logoutAdmin, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const logout = async () => {
    await logoutAdmin();
    navigate("/");
  };
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const adminLinks = [
    {
      href: "/create",
      label: "Create User",
      icon: UserPlus,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  const userLinks = [
    {
      href: `/user/${userId}/profile`,
      label: "User Profile",
      icon: User,
    },
    {
      href: `/user/${userId}/fund`,
      label: "Fund Account",
      icon: CreditCard,
    },
    {
      href: `/user/${userId}/debit`,
      label: "Debit Account",
      icon: CreditCard,
    },
    {
      href: `/user/${userId}/transactions`,
      label: "Transaction History",
      icon: History,
    },
    {
      href: `/user/${userId}/code`,
      label: "Transaction Code",
      icon: QrCode,
    },
    {
      href: `/user/${userId}/edit`,
      label: "Edit Account",
      icon: Pencil,
    },
  ];

  const links = userId ? userLinks : adminLinks;

  return (
    <>
      <div className="fixed inset-0 z-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        />

        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ duration: 0.2 }}
          className="absolute z-100 h-full min-w-[250px] bg-[#122f3b] block min-[770px]:hidden"
        >
          <header className="h-[71px] flex items-center justify-between gap-2 px-4">
            <img src="/logo.png" alt="logo" width={40} height={40} />
            <button
              onClick={onClose}
              className="btn text-white h-10 w-10 rounded-full"
            >
              <X />
            </button>
          </header>
          <div className="flex flex-col gap-2 h-[calc(100dvh-71px)] p-4">
            <nav>
              <ul className="flex flex-col gap-2">
                <li className="rounded-lg flex items-center gap-2 w-full">
                  <NavLink
                    to="/dashboard"
                      className={({ isActive }) =>`text-xs
                     ${isActive
                        ? "text-white w-full bg-gradient-to-br from-gradient-1 to-gradient-2 flex items-center gap-2 p-3 rounded-0"
                        : "text-white flex items-center gap-2 p-3 rounded-0 w-full hover:bg-gradient-to-br from-gradient-1 to-gradient-2"
                     }`}
                  >
                    <LayoutDashboard size={20} />
                    <span className="">Dashboard</span>
                  </NavLink>
                </li>
                {links.map((item) => (
                  <li
                    key={item.href}
                    className="rounded-lg flex items-center gap-2 w-full"
                  >
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>`text-xs
                        ${isActive
                          ? "text-white w-full bg-gradient-to-br from-gradient-1 to-gradient-2 flex items-center gap-2 p-3 rounded-md"
                          : "text-white flex items-center gap-2 p-3 rounded-lg w-full hover:bg-gradient-to-br from-gradient-1 to-gradient-2"
                      }`}
                    >
                      <item.icon size={20} />
                      <span className="">{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <button
              onClick={logout}
              disabled={isLoading}
              className="ms-auto mt-auto btn-primary w-full h-10 rounded-lg"
            >
              {isLoading ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <LogOut size={20} />
              )}
              <span>{isLoading ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Mobilebar;
