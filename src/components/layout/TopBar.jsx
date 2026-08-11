import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import ThemeToggle from "../ThemeToggle.jsx";

function TopBar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50"
        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
    }`;

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="text-slate-900 dark:text-white text-lg font-semibold tracking-tight">
          Waypoint
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/dashboard" className={linkClass}>
            Stats
          </NavLink>
          <NavLink to="/paste-to-track" className={linkClass}>
            Paste to Track
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-red-600 dark:hover:text-red-400 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
