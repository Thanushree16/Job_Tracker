import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ThemeToggle from "../components/ThemeToggle.jsx";
import StatusStamp from "../components/StatusStamp.jsx";
import WaypointIcon from "../components/WaypointIcon.jsx";

const FEATURES = [
  {
    icon: "¶",
    title: "Paste to Track",
    description: "Drop in a job description and Waypoint pulls out the company, role and link for you.",
  },
  {
    icon: "⌘",
    title: "Capture from anywhere",
    description: "The browser extension saves a listing to your board without leaving the tab.",
  },
  {
    icon: "◔",
    title: "See where you stand",
    description: "Applied, interview, offer, rejected — with response rates you can actually act on.",
  },
];

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
          <Link
            to="/"
            className="flex items-center gap-2 text-ink dark:text-parchment text-lg font-semibold font-display tracking-wide"
          >
            <WaypointIcon className="w-5 h-5 text-moss dark:text-moss-bright" />
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

      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
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

      <div className="max-w-4xl mx-auto border-t border-border-light dark:border-border-dark" />

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-parchment dark:bg-border-dark border border-border-light dark:border-border-dark rounded-md p-6"
            >
              <div className="w-9 h-9 rounded-md bg-paper dark:bg-night border border-border-light dark:border-border-dark flex items-center justify-center text-moss dark:text-moss-bright text-lg font-display mb-4">
                {feature.icon}
              </div>
              <h3 className="text-ink dark:text-parchment font-semibold font-display tracking-wide mb-2">
                {feature.title}
              </h3>
              <p className="text-stone text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default LandingPage;