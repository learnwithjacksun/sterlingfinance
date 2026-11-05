import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { navLinks } from "@/Constants/data";
import clsx from "clsx";
import { useEffect } from "react";
import { motion } from "framer-motion";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
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

  const location = useLocation();

  return (
    <>
      <div className="fixed inset-0 z-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}                                                                                    
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        />

        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ duration: 0.2 }}
          className="absolute h-full w-[300px] bg-secondary z-50"
        >
          <div className="flex items-center justify-between h-[70px] main"> 
            <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="logo" width={40} height={40} />
            </Link>

            <button
              onClick={onClose}
              className="btn btn-foreground h-10 w-10 rounded-full"
            >
              <X />
            </button>
          </div>

          <ul className="flex flex-col gap-4 px-4 mt-10">
            {navLinks.map((item, index) => (
              <li key={item.label} data-aos-delay={100 * index}>
                <a
                  href={item.href}
                  onClick={onClose}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-foreground",
                    location.pathname === item.href && "bg-foreground"
                  )}
                >
                  
                  <span className="text-sm font-sora font-medium">
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </>
  );
};

export default MobileMenu;
