import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ThemeToggle from "../components/ThemeToggle.jsx";

function LandingPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
      else setChecking(false);
    });
  }, [navigate]);

  if (checking) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-slate-900 dark:text-white text-lg font-semibold tracking-tight">
            Waypoint
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/auth"
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            >
              Login
            </Link>
            <Link
              to="/auth?mode=signup"
              className="px-4 py-2 text-sm font-medium bg-blue-700 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg transition shadow-sm"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h1 className="text-slate-900 dark:text-white text-4xl sm:text-5xl font-bold tracking-tight">
          Track every job application in one place.
        </h1>
        <p className="mt-4 text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Waypoint keeps your applications organized — from first submit to final offer.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/auth?mode=signup"
            className="px-6 py-3 text-sm font-medium bg-blue-700 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg transition shadow-sm"
          >
            Get started free
          </Link>
          
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
