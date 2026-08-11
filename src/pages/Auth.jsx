import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

function Auth() {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
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

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        alert("Login failed: " + error.message);
      } else {
        navigate("/dashboard");
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        alert("Sign up failed: " + error.message);
      } else {
        navigate("/dashboard");
      }
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setResetSent(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-paper dark:bg-night transition-colors">
      <div className="bg-parchment dark:bg-night rounded-md p-8 w-96 flex flex-col gap-4 border border-border-light dark:border-border-dark">
        <h2 className="text-ink dark:text-parchment text-2xl font-bold font-display tracking-wide">
          {mode === "login" && "Login"}
          {mode === "signup" && "Sign Up"}
          {mode === "forgot" && "Reset Password"}
        </h2>

        {mode === "forgot" && resetSent ? (
          <div className="flex flex-col gap-4">
            <p className="text-stone text-sm">
              Check <span className="text-ink dark:text-parchment font-medium">{email}</span> for a link to reset your password.
            </p>
            <button
              onClick={() => switchMode("login")}
              className="w-full bg-moss hover:bg-moss-bright text-parchment font-semibold rounded-md py-2 transition border border-moss dark:border-moss-bright"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-paper dark:bg-border-dark border border-border-light dark:border-border-dark rounded-md px-4 py-2 text-ink dark:text-parchment placeholder-stone outline-none focus:border-moss dark:focus:border-moss-bright"
            />

            {mode !== "forgot" && (
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-paper dark:bg-border-dark border border-border-light dark:border-border-dark rounded-md px-4 py-2 text-ink dark:text-parchment placeholder-stone outline-none focus:border-moss dark:focus:border-moss-bright"
              />
            )}

            {mode === "login" && (
              <p
                onClick={() => switchMode("forgot")}
                className="text-stone text-xs text-right -mt-1 cursor-pointer hover:text-ink dark:hover:text-parchment"
              >
                Forgot password?
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-moss hover:bg-moss-bright text-parchment font-semibold rounded-md py-2 transition border border-moss dark:border-moss-bright disabled:opacity-50"
            >
              {mode === "login" && "Login"}
              {mode === "signup" && "Sign Up"}
              {mode === "forgot" && (loading ? "Sending..." : "Send reset link")}
            </button>
          </form>
        )}

        {mode !== "forgot" && (
          <p
            onClick={() => switchMode(mode === "login" ? "signup" : "login")}
            className="text-stone text-sm text-center cursor-pointer hover:text-ink dark:hover:text-parchment"
          >
            {mode === "login"
              ? "Don't have an account? Sign Up"
              : "Already have an account? Login"}
          </p>
        )}

        {mode === "forgot" && !resetSent && (
          <p
            onClick={() => switchMode("login")}
            className="text-stone text-sm text-center cursor-pointer hover:text-ink dark:hover:text-parchment"
          >
            Back to Login
          </p>
        )}
      </div>
    </div>
  );
}

export default Auth;
