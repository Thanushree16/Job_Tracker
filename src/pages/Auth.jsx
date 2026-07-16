import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950">
      <div className="bg-zinc-900 rounded-xl p-8 w-96 flex flex-col gap-4 border border-zinc-800">
        <h2 className="text-white text-2xl font-bold">
          {isLogin ? "Login" : "Sign Up"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            className="w-full bg-white text-black font-semibold rounded-lg py-2 hover:bg-zinc-200 transition-colors"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
        <p
          onClick={() => setIsLogin(!isLogin)}
          className="text-zinc-500 text-sm text-center cursor-pointer hover:text-zinc-300"
        >
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}

export default Auth;
