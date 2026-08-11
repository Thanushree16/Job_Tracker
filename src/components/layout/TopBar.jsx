import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import ThemeToggle from "../ThemeToggle.jsx";
import WaypointIcon from "../WaypointIcon.jsx";

function TopBar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "text-moss dark:text-moss-bright bg-parchment dark:bg-border-dark"
        : "text-stone hover:text-ink dark:hover:text-parchment hover:bg-parchment dark:hover:bg-border-dark"
    }`;

  return (
    <header className="border-b border-border-light dark:border-border-dark bg-paper dark:bg-night">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-ink dark:text-parchment text-lg font-semibold font-display tracking-wide"
        >
          <WaypointIcon className="w-5 h-5 text-moss dark:text-moss-bright" />
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
            className="px-4 py-2 text-sm font-medium text-stone dark:text-stone border border-border-light dark:border-border-dark rounded-md hover:bg-parchment dark:hover:bg-border-dark hover:text-brick dark:hover:text-brick-bright transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopBar;