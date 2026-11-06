import { NavLink } from "react-router-dom"
import { dashboardMenuItems } from "@/Constants/data"
import { LogOut, Loader } from "lucide-react"
import { useAuthStore } from "@/Stores"
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
const Sidebar = () => {
  const { logout: logoutUser, isLoading: isLoading } = useAuthStore();
  const navigate = useNavigate();
  const logout = () => {
    toast.promise(logoutUser, {
      loading: "Logging out...",
      success: () => {
        navigate("/"); 
        return "Logged out successfully";
      },
      error: (error) => {
        return error.message;
      }
    })
  }
  const links = dashboardMenuItems;
  return (
    <>
      <div className="min-w-[250px] bg-[#122f3b] hidden md:block border-r border-line">
        <header className="h-[71px] flex items-center gap-2 px-4">
          <img src="/logo.png" alt="logo" className="w-10 h-10" />
          {/* <h4 className="text-white font-sora font-medium text-base">
          Sterling Holdings
        </h4> */}
        </header>
        <div className="flex flex-col gap-2 h-[calc(100dvh-71px)] p-4">
          <nav>
            <ul className="flex flex-col gap-2">
              {links.map((item) => (
                <li
                  key={item.href}
                  className="rounded-lg flex items-center gap-2 w-full"
                >
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      isActive
                        ? "text-white w-full text-sm bg-gradient-to-br from-gradient-1 to-gradient-2 flex items-center gap-2 p-3 rounded-md"
                        : "text-white flex items-center text-sm gap-2 p-3 rounded-lg w-full hover:bg-gradient-to-br from-gradient-1 to-gradient-2"
                    }
                  >
                    <item.icon size={20} />
                    <span className="text-sm">{item.label}</span>
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
}

export default Sidebar