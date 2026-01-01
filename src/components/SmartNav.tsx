import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Calendar,
  BarChart2,
  PenTool,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const SmartNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: "/", icon: <Home size={20} />, label: "Dashboard" },
    { path: "/calendar", icon: <Calendar size={20} />, label: "Calendar" },
    { path: "/daily-log", icon: <PenTool size={20} />, label: "Daily Hub" },
    { path: "/analytics", icon: <BarChart2 size={20} />, label: "Analytics" },
    // Settings is usually less accessed, maybe keep it separate or included
    // { path: "/settings", icon: <Settings size={20} />, label: "Settings" },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center">
      {/* Expanded Menu */}
      <div
        className={`bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center gap-2 transition-all duration-300 ease-out origin-bottom ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-90 opacity-0 translate-y-8 pointer-events-none"
        }`}
        style={{
          position: isOpen ? "relative" : "absolute",
          bottom: isOpen ? 0 : "100%",
        }}
      >
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNav(item.path)}
            className={`p-3 rounded-xl flex items-center gap-2 transition-all ${
              location.pathname === item.path
                ? "bg-white text-black shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
            title={item.label}
          >
            {item.icon}
            <span
              className={`text-sm font-medium ${
                location.pathname === item.path ? "block" : "hidden sm:block"
              }`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`mt-4 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-all z-50 ${
          isOpen ? "rotate-180" : ""
        }`}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  );
};

export default SmartNav;
