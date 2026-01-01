import {
  Home,
  Calendar,
  AreaChart,
  LogOut,
  Settings,
  PenTool,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-20 h-screen bg-black/40 border-r border-white/10 flex flex-col items-center py-8 z-50 backdrop-blur-md sticky top-0 flex-shrink-0">
      <div className="mb-8 p-2 rounded-xl bg-white/5 border border-white/10">
        <div className="w-6 h-6 bg-white rounded-full"></div>
      </div>

      <nav className="flex-1 space-y-6 flex flex-col items-center w-full">
        <NavItem
          to="/"
          icon={<Home size={22} />}
          label="Dashboard"
          active={isActive("/")}
        />
        <NavItem
          to="/daily-log"
          icon={<PenTool size={22} />}
          label="Daily Hub"
          active={isActive("/daily-log")}
        />
        <NavItem
          to="/calendar"
          icon={<Calendar size={22} />}
          label="Calendar"
          active={isActive("/calendar")}
        />
        <NavItem
          to="/analytics"
          icon={<AreaChart size={22} />}
          label="Analytics"
          active={isActive("/analytics")}
        />
      </nav>

      <div className="mt-auto flex flex-col items-center gap-4">
        <NavItem
          to="/settings"
          icon={<Settings size={22} />}
          label="Settings"
          active={isActive("/settings")}
        />
        <button
          onClick={handleLogout}
          className="p-3 text-gray-500 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};

const NavItem = ({
  icon,
  label,
  to,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
}) => (
  <Link
    to={to}
    className={`p-3 rounded-xl transition-all cursor-pointer group relative ${
      active
        ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
        : "text-gray-500 hover:text-white hover:bg-white/5"
    }`}
  >
    {icon}
    <div className="absolute left-14 ml-0 px-2 py-1 bg-[#1A1A1A] border border-white/10 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
      {label}
    </div>
  </Link>
);

export default Sidebar;
