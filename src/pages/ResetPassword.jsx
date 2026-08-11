import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    // Supabase automatically picks up the recovery token from the URL
    // (the link Supabase emailed) and establishes a temporary session for
    // this call — no manual token parsing needed on our end.
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(
        updateError.message.toLowerCase().includes("session")
          ? "This reset link has expired or already been used. Request a new one from the login page."
          : updateError.message
      );
      return;
    }

    setSuccess(true);
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-paper dark:bg-night transition-colors">
      <div className="bg-parchment dark:bg-night rounded-md p-8 w-96 flex flex-col gap-4 border border-border-light dark:border-border-dark">
        <h2 className="text-ink dark:text-parchment text-2xl font-bold font-display tracking-wide">Set a New Password</h2>

        {success ? (
          <p className="text-stone text-sm">
            Password updated. Redirecting you to login...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-paper dark:bg-border-dark border border-border-light dark:border-border-dark rounded-md px-4 py-2 text-ink dark:text-parchment placeholder-stone outline-none focus:border-moss dark:focus:border-moss-bright"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-paper dark:bg-border-dark border border-border-light dark:border-border-dark rounded-md px-4 py-2 text-ink dark:text-parchment placeholder-stone outline-none focus:border-moss dark:focus:border-moss-bright"
            />

            {error && <p className="text-brick dark:text-brick-bright text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-moss hover:bg-moss-bright text-parchment font-semibold rounded-md py-2 transition border border-moss dark:border-moss-bright disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
