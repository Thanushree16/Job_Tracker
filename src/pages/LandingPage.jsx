import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ThemeToggle from "../components/ThemeToggle.jsx";
import StatusStamp from "../components/StatusStamp.jsx";

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
    <div className="min-h-screen bg-paper dark:bg-night transition-colors">
      <header className="border-b border-border-light dark:border-border-dark">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-ink dark:text-parchment text-lg font-semibold font-display tracking-wide">
            Waypoint
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/auth"
              className="px-4 py-2 text-sm font-medium text-stone hover:text-ink dark:hover:text-parchment transition"
            >
              Login
            </Link>
            <Link
              to="/auth?mode=signup"
              className="px-4 py-2 text-sm font-medium bg-moss hover:bg-moss-bright text-parchment rounded-md transition border border-moss dark:border-moss-bright"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <StatusStamp status="applied" label="APPLIED" seed="A" />
          <StatusStamp status="interview" label="INTERVIEW" seed="I" />
          <StatusStamp status="offer" label="OFFER" seed="O" />
        </div>

        <h1 className="text-ink dark:text-parchment text-4xl sm:text-5xl font-bold font-display tracking-wide">
          Track every job application in one place.
        </h1>
        <p className="mt-4 text-stone text-lg max-w-2xl mx-auto">
          Waypoint keeps your applications organized — from first submit to final offer.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/auth?mode=signup"
            className="px-6 py-3 text-sm font-medium bg-moss hover:bg-moss-bright text-parchment rounded-md transition border border-moss dark:border-moss-bright"
          >
            Get started free
          </Link>
          
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
