import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import MotionBg from "../components/MotionBg";
import { TEAM } from "../config/team";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); // This is crucial for form submission
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white relative flex items-center justify-center px-6">
      <MotionBg />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-crimson text-sm font-semibold uppercase tracking-widest mb-3">
            Members Only
          </p>
          <h1 className="text-4xl font-extrabold">
            Welcome Back<span className="text-crimson">.</span>
          </h1>
          <p className="text-white/40 mt-3 text-sm">
            Sign in to access the {TEAM.name} dashboard
          </p>
        </div>

        {/* Form Container */}
        {/* Changed from <div> to <form> to handle Enter key submits */}
        <form 
          onSubmit={handleLogin} 
          className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col gap-5"
        >
          {error && (
            <div className="bg-crimson/20 border border-crimson/40 text-crimson text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-crimson transition-colors duration-200 placeholder:text-white/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-crimson transition-colors duration-200 placeholder:text-white/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-crimson text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer Links */}
        <p className="text-center text-white/30 text-sm mt-6">
          Not a member?{" "}
          <a href="/" className="text-crimson hover:underline">
            Go back home
          </a>
        </p>

        <p className="text-center text-white/20 text-xs mt-3">
          New squad member?{" "}
          <a
            href="https://center-of-void.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="text-white/40 hover:text-crimson transition-colors duration-200 underline underline-offset-2"
          >
            Register here
          </a>
        </p>
      </motion.div>
    </div>
  );
}