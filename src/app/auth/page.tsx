"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Activity, Lock, Mail, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Sign In
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        if (data.session) {
          const token = data.session.access_token;
          // Store token
          localStorage.setItem("sb-access-token", token);
          localStorage.setItem("supabase_token", token);

          // Sync user to DB
          try {
            await fetch(`${API_URL}/api/auth/sync-user`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });
          } catch (syncErr) {
            console.error("Failed to sync profile:", syncErr);
          }

          setSuccess("Login successful! Redirecting...");
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        }
      } else {
        // Sign Up
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (data.user) {
          // If auto-confirm is enabled or if session is returned
          if (data.session) {
            const token = data.session.access_token;
            localStorage.setItem("sb-access-token", token);
            localStorage.setItem("supabase_token", token);

            try {
              await fetch(`${API_URL}/api/auth/sync-user`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              });
            } catch (syncErr) {
              console.error("Failed to sync profile:", syncErr);
            }

            setSuccess("Signup successful! Redirecting...");
            setTimeout(() => {
              router.push("/dashboard");
            }, 1000);
          } else {
            setSuccess("Signup successful! Please check your email to confirm registration.");
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] relative overflow-hidden px-4">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#7C3AED]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#06B6D4]/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Activity className="h-8 w-8 text-[#7C3AED]" />
          <span className="font-bold text-2xl tracking-tight text-white">PerfDoctor AI</span>
        </div>

        {/* Auth Card */}
        <div className="bg-[#111111]/80 backdrop-blur-xl rounded-2xl border border-[#222222] p-8 shadow-2xl shadow-black/80">
          <div className="flex border-b border-[#222222] mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(null); setSuccess(null); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors relative ${isLogin ? "text-white" : "text-[#A1A1AA] hover:text-white"}`}
            >
              Sign In
              {isLogin && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED]"
                />
              )}
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); setSuccess(null); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors relative ${!isLogin ? "text-white" : "text-[#A1A1AA] hover:text-white"}`}
            >
              Sign Up
              {!isLogin && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED]"
                />
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#555555]" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-[#555555] focus:outline-none focus:border-[#7C3AED] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#555555]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-[#555555] focus:outline-none focus:border-[#7C3AED] transition-colors"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-start gap-2 text-sm text-[#EF4444]"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 flex items-start gap-2 text-sm text-[#10B981]"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-[#7C3AED]/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setEmail("pallavipatel8080@gmail.com");
                  setPassword("demo1234");
                  setError(null);
                  setSuccess("Filled demo credentials!");
                }}
                className="text-xs text-[#7C3AED] hover:text-[#A78BFA] transition-colors"
              >
                Use Demo Credentials
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
