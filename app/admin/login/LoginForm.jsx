"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid email or password.");
      }

      // Successful login -> Redirect to /admin
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Login Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#c99a55]/20 bg-[#062623]/80 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#c99a55]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[#104b44]/20 blur-3xl" />

        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center">
            <img
              src="/assets/ravion_logo_svg-01.svg"
              alt="RAVION"
              className="h-10 w-auto brightness-0 invert"
            />
          </div>
          <div className="inline-block rounded-full border border-[#c99a55]/30 bg-[#c99a55]/10 px-3 py-1 font-mono text-[11px] font-medium tracking-widest text-[#d1aa6b] uppercase">
            Private Admin Access
          </div>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-[#f5f0e8] tracking-tight">
            Admin Login
          </h1>
          <p className="mt-1 text-sm text-[#f5f0e8]/60">
            Sign in to access your administrative dashboard
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-sm text-red-200">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block font-mono text-xs font-medium tracking-wider text-[#d1aa6b] uppercase"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#f5f0e8]/40">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ruchit@gmail.com"
                disabled={isLoading}
                className="w-full rounded-xl border border-[#c99a55]/20 bg-[#041a18]/70 py-3 pl-10 pr-4 text-sm text-[#f5f0e8] placeholder-[#f5f0e8]/30 transition-all focus:border-[#c99a55] focus:bg-[#041a18] focus:outline-none focus:ring-1 focus:ring-[#c99a55]"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block font-mono text-xs font-medium tracking-wider text-[#d1aa6b] uppercase"
            >
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#f5f0e8]/40">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full rounded-xl border border-[#c99a55]/20 bg-[#041a18]/70 py-3 pl-10 pr-11 text-sm text-[#f5f0e8] placeholder-[#f5f0e8]/30 transition-all focus:border-[#c99a55] focus:bg-[#041a18] focus:outline-none focus:ring-1 focus:ring-[#c99a55]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#f5f0e8]/40 hover:text-[#d1aa6b] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c99a55] to-[#dfb87c] py-3.5 text-sm font-semibold tracking-wide text-[#062623] shadow-lg shadow-[#c99a55]/20 transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>AUTHENTICATING...</span>
              </>
            ) : (
              <span>LOGIN</span>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="font-mono text-[11px] text-[#f5f0e8]/40">
            Protected by RAVION Secure Admin Shield
          </p>
        </div>
      </div>
    </div>
  );
}
