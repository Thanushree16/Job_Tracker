import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="flex flex-col h-full w-64 bg-zinc-900 border-r border-zinc-800 p-6">
      
      {/* Top — logo + nav */}
      <div className="flex flex-col gap-8">
        <h2 className="text-white text-lg font-semibold tracking-tight">
          Job Tracker
        </h2>

        <ul className="flex flex-col gap-1">
          <li>
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-zinc-400 text-sm hover:bg-zinc-800 hover:text-white transition-colors"
            >
              Stats
            </Link>
          </li>
          <li>
            <Link
              to="/paste"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-zinc-400 text-sm hover:bg-zinc-800 hover:text-white transition-colors"
            >
              Paste to Track
            </Link>
          </li>
          {/* <li>
            <Link
              to="/resume"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-zinc-400 text-sm hover:bg-zinc-800 hover:text-white transition-colors"
            >
              Resume Optimizer
            </Link>
          </li> */}
          <li>
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-zinc-400 text-sm hover:bg-zinc-800 hover:text-white transition-colors"
            >
              Profile
            </Link>
          </li>
        </ul>
      </div>

      {/* Bottom — logout */}
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-zinc-400 text-sm hover:bg-zinc-800 hover:text-red-400 transition-colors"
        >
          Logout
        </button>
      </div>

    </div>
  );
}

export default Sidebar;