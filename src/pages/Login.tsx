import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) setError(error.message);
    else setError("Check your email for the confirmation link!");
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] relative overflow-hidden font-sans text-white">
      {/* Background Circuitry Nodes */}
      {/* Top Left */}
      <div className="absolute top-20 left-10 w-32 h-20 border border-white/10 rounded-lg bg-[#111] hidden md:block">
        <div className="absolute -right-1 top-1/2 w-2 h-2 bg-white/50 rounded-full translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
        <div className="w-full h-full flex items-center justify-center gap-1">
          <div className="w-1 h-1 bg-white/20 rounded-full"></div>
          <div className="w-1 h-1 bg-white/20 rounded-full"></div>
          <div className="w-1 h-1 bg-white/20 rounded-full"></div>
        </div>
      </div>

      {/* Top Right */}
      <div className="absolute top-20 right-10 w-32 h-20 border border-white/10 rounded-lg bg-[#111] hidden md:block">
        <div className="absolute -left-1 top-1/2 w-2 h-2 bg-white/50 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
        <div className="w-full h-full flex items-center justify-center gap-1">
          <div className="w-1 h-1 bg-white/20 rounded-full"></div>
          <div className="w-1 h-1 bg-white/20 rounded-full"></div>
          <div className="w-1 h-1 bg-white/20 rounded-full"></div>
        </div>
      </div>

      {/* Bottom Left */}
      <div className="absolute bottom-20 left-10 w-32 h-20 border border-white/10 rounded-lg bg-[#111] hidden md:block">
        <div className="absolute -right-1 top-1/2 w-2 h-2 bg-white/50 rounded-full translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
      </div>

      {/* Bottom Right */}
      <div className="absolute bottom-20 right-10 w-32 h-20 border border-white/10 rounded-lg bg-[#111] hidden md:block">
        <div className="absolute -left-1 top-1/2 w-2 h-2 bg-white/50 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
      </div>

      {/* Connecting Lines (Simulated via SVG) */}
      <svg className="absolute inset-0 pointer-events-none opacity-20 hidden md:block">
        <path
          d="M 160 120 L 400 350"
          stroke="white"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M calc(100% - 160px) 120 L calc(100% - 400px) 350"
          stroke="white"
          strokeWidth="1"
          fill="none"
        />

        <path
          d="M 160 calc(100% - 120px) L 400 calc(100% - 350px)"
          stroke="white"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M calc(100% - 160px) calc(100% - 120px) L calc(100% - 400px) calc(100% - 350px)"
          stroke="white"
          strokeWidth="1"
          fill="none"
        />
      </svg>

      {/* Login Card */}
      <div className="relative z-10 w-[400px] p-8 rounded-2xl bg-[#0A0A0A] border border-white/10 shadow-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#111] border border-white/10 flex items-center justify-center overflow-hidden">
            <img
              src="/logo.png"
              alt="LifeOS Logo"
              className="w-full h-full object-cover p-2"
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-sm text-gray-400">
            Don't have an account yet?{" "}
            <span
              onClick={handleSignUp}
              className="text-white font-medium cursor-pointer hover:underline"
            >
              Sign up
            </span>
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm"
              placeholder="email address"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm"
              placeholder="Password"
              required
            />
          </div>

          {error && (
            <div className="text-red-400 text-xs text-center bg-red-900/10 py-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#007AFF] text-white font-semibold py-3 rounded-lg hover:bg-[#0066CC] transition-colors mt-2 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Login"}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0A0A0A] px-2 text-gray-500">OR</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center py-3 bg-[#111] hover:bg-[#1a1a1a] rounded-lg border border-white/10 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
            </svg>
          </button>
          <button className="flex items-center justify-center py-3 bg-[#111] hover:bg-[#1a1a1a] rounded-lg border border-white/10 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
