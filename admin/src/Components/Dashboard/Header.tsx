import { Menu } from "lucide-react";
import  Goback  from "./Goback" ;
import { ProfileCard } from "./ProfileCard";
import { useState } from "react";
import Mobilebar from "./Mobilebar";
import { AnimatePresence } from "framer-motion";
const Header = ({ isDashboard }: { isDashboard: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 w-full bg-secondary z-50 border-b border-line">
        <nav className="w-[90%] mx-auto h-[70px] flex items-center line">
          {!isDashboard ? (
            <div className="md:hidden block">
              <Goback />
            </div>
          ) : (
            <div className="md:hidden block">
             <a href="/">
              <img src="/logo.png" alt="logo" width={40} height={40} />
             </a>
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            <ProfileCard />

            <div
              onClick={() => setIsOpen(true)}
              className="md:hidden h-10 w-10 rounded-full bg-secondary flex items-center justify-center"
            >
              <Menu size={22} />
            </div>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {isOpen && (
          <Mobilebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
