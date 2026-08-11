import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.54-5.17 3.54-8.65z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.92H1.3v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.31 14.32c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.67H1.3A11.98 11.98 0 000 12c0 1.94.46 3.77 1.3 5.39l4.01-3.07z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.3 6.67l4.01 3.07C6.25 6.9 8.89 4.77 12 4.77z" />
    </svg>
  );
}

const COPY = {
  login: { heading: "Welcome back", subtext: "Pick up where you left off." },
  signup: { heading: "Create your account", subtext: "Start tracking every application in one place." },
  forgot: { heading: "Reset password", subtext: "We'll email you a link to set a new one." },
};

function Auth() {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "forgot") {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);

      if (error) {
        alert("Couldn't send reset email: " + error.message);
      } else {
        setResetSent(true);
      }
      return;
    }

    setLoading(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        alert("Login failed: " + error.message);
      } else {
        navigate("/dashboard");
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        alert("Sign up failed: " + error.message);
      } else {
        navigate("/dashboard");
      }
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      alert("Google sign-in failed: " + error.message);
      setGoogleLoading(false);
    }
    // On success, Supabase redirects away from this page — no further
    // state update needed here.
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setResetSent(false);
  };

  const inputClasses =
    "w-full bg-paper dark:bg-border-dark border border-border-light dark:border-border-dark rounded-md px-4 py-2.5 text-ink dark:text-parchment placeholder-stone outline-none focus:border-moss dark:focus:border-moss-bright transition";

  const labelClasses = "text-stone text-xs uppercase tracking-widest font-display";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-paper dark:bg-night px-4 transition-colors">
      <div className="bg-parchment dark:bg-night border border-border-light dark:border-border-dark rounded-md p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <h2 className="text-ink dark:text-parchment text-2xl font-bold font-display tracking-wide">
            {COPY[mode].heading}
          </h2>
          <p className="text-stone text-sm mt-1">{COPY[mode].subtext}</p>
        </div>

        {mode === "forgot" && resetSent ? (
          <div className="flex flex-col gap-4">
            <p className="text-stone text-sm text-center">
              Check <span className="text-ink dark:text-parchment font-medium">{email}</span> for the reset link.
            </p>
            <button
              onClick={() => switchMode("login")}
              className="w-full bg-moss hover:bg-moss-bright text-parchment font-semibold rounded-md py-2.5 transition border border-moss dark:border-moss-bright"
            >
              Back to login
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelClasses}>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputClasses}
                />
              </div>

              {mode !== "forgot" && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className={labelClasses}>Password</label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="text-xs text-stone hover:text-moss dark:hover:text-moss-bright transition"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={inputClasses}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-moss hover:bg-moss-bright text-parchment font-semibold rounded-md py-2.5 transition border border-moss dark:border-moss-bright disabled:opacity-50 mt-1"
              >
                {mode === "login" && (loading ? "Logging in..." : "Log in")}
                {mode === "signup" && (loading ? "Creating account..." : "Sign up")}
                {mode === "forgot" && (loading ? "Sending..." : "Send reset link")}
              </button>
            </form>

            {mode !== "forgot" && (
              <>
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 border-t border-border-light dark:border-border-dark" />
                  <span className="text-stone text-xs uppercase tracking-widest font-display">or</span>
                  <div className="flex-1 border-t border-border-light dark:border-border-dark" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-2 bg-paper dark:bg-border-dark border border-border-light dark:border-border-dark text-ink dark:text-parchment font-medium rounded-md py-2.5 hover:bg-border-light dark:hover:bg-night transition disabled:opacity-50"
                >
                  <GoogleIcon />
                  {googleLoading ? "Connecting..." : "Continue with Google"}
                </button>
              </>
            )}
          </>
        )}

        {mode !== "forgot" && !resetSent && (
          <p className="text-stone text-sm text-center mt-6">
            {mode === "login" ? "New to Waypoint? " : "Already have an account? "}
            <button
              onClick={() => switchMode(mode === "login" ? "signup" : "login")}
              className="text-moss dark:text-moss-bright font-medium hover:underline"
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        )}

        {mode === "forgot" && !resetSent && (
          <p className="text-stone text-sm text-center mt-6">
            <button
              onClick={() => switchMode("login")}
              className="text-moss dark:text-moss-bright font-medium hover:underline"
            >
              Back to login
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default Auth;