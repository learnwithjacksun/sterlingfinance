import { NavLink } from "react-router-dom";
import {
  LogOut,
  Loader,
  CreditCard,
  QrCode,
  Pencil,
  UserPlus,
  User,
  Settings,
  LayoutDashboard,
  History,
} from "lucide-react";
import { useAuthStore } from "@/Stores";
import { useNavigate, useMatch } from "react-router-dom";


const Sidebar = () => {

  // The selected user comes from the URL, so it survives a page refresh.
  const userId = useMatch("/user/:id/*")?.params.id;
  const { logout: logoutAdmin, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const logout = async () => {
    await logoutAdmin();
    navigate(`/`);
  };
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
      <div className="w-[250px] bg-[#122f3b] hidden md:block border-r border-line">
        <header className="h-[71px] flex items-center gap-2 px-4">
          <img src="/logo.png" alt="logo" className="w-10 h-10" />
          {/* <h4 className="text-white font-sora font-medium text-base">
            True Mark Financial Bank
          </h4> */}
        </header>
        <div className="flex flex-col gap-2 h-[calc(100dvh-71px)] p-4">
          <nav>
            <ul className="flex flex-col gap-2">
              <li className="rounded-lg flex items-center gap-2 w-full">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    isActive
                      ? "text-white w-full text-[10px] bg-gradient-to-br from-gradient-1 to-gradient-2 flex items-center gap-2 p-3 rounded-md"
                      : "text-white flex text-xs items-center gap-2 p-3 rounded-lg w-full hover:bg-gradient-to-br from-gradient-1 to-gradient-2"
                  }
                >
                  <LayoutDashboard size={20} />
                  <span className="text-[12px]">Dashboard</span>
                </NavLink>
              </li>
              {links.map((item) => (
                <li
                  key={item.href}
                  className="rounded-lg flex items-center gap-2 w-full"
                >
                  <NavLink
                    to={item.href}
                    className={({ isActive }) => 
                      isActive
                        ? "text-white w-full bg-gradient-to-br from-gradient-1 to-gradient-2 flex items-center gap-2 p-3 rounded-md"
                        : "text-white flex items-center gap-2 p-3 rounded-lg w-full hover:bg-gradient-to-br from-gradient-1 to-gradient-2"
                    }
                  >
                    <item.icon size={20} />
                    <span className="text-[12px]">{item.label}</span>
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
      </div>
    </>
  );
};

export default Sidebar;
