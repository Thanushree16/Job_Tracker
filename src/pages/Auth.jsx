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
        navigate("/");
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        alert("Sign up failed: " + error.message);
      } else {
        navigate("/");
      }
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setResetSent(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950">
      <div className="bg-zinc-900 rounded-xl p-8 w-96 flex flex-col gap-4 border border-zinc-800">
        <h2 className="text-white text-2xl font-bold">
          {mode === "login" && "Login"}
          {mode === "signup" && "Sign Up"}
          {mode === "forgot" && "Reset Password"}
        </h2>

        {mode === "forgot" && resetSent ? (
          <div className="flex flex-col gap-4">
            <p className="text-zinc-300 text-sm">
              Check <span className="text-white font-medium">{email}</span> for a link to reset your password.
            </p>
            <button
              onClick={() => switchMode("login")}
              className="w-full bg-white text-black font-semibold rounded-lg py-2 hover:bg-zinc-200 transition-colors"
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
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
            />

            {mode !== "forgot" && (
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
              />
            )}

            {mode === "login" && (
              <p
                onClick={() => switchMode("forgot")}
                className="text-zinc-500 text-xs text-right -mt-1 cursor-pointer hover:text-zinc-300"
              >
                Forgot password?
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-semibold rounded-lg py-2 hover:bg-zinc-200 transition-colors disabled:opacity-50"
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
            className="text-zinc-500 text-sm text-center cursor-pointer hover:text-zinc-300"
          >
            {mode === "login"
              ? "Don't have an account? Sign Up"
              : "Already have an account? Login"}
          </p>
        )}

        {mode === "forgot" && !resetSent && (
          <p
            onClick={() => switchMode("login")}
            className="text-zinc-500 text-sm text-center cursor-pointer hover:text-zinc-300"
          >
            Back to Login
          </p>
        )}
      </div>
    </div>
  );
}

export default Auth;