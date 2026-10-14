"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle, Sparkles, ArrowRight } from "lucide-react";

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

      // Successful login -> Redirect directly to the unified Link in Bio Hub
      router.push("/admin/bio");
      router.refresh();
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10">
      {/* Decorative Outer Ambient Halo */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-[#c99a55]/30 via-transparent to-[#c99a55]/10 blur-xl opacity-75 pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[#c99a55]/30 bg-[#021311]/90 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl">
        {/* Subtle decorative radial light */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#c99a55]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-[#08453e]/25 blur-3xl" />

        {/* Brand Luxury Header */}
        <div className="mb-8 text-center relative">
          <div className="mb-4 inline-flex items-center justify-center relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#c99a55] via-[#dfb77b] to-[#8c672e] p-3 shadow-xl shadow-[#c99a55]/25 border border-[#dfb77b]/40">
              <img
                src="/assets/ravion_logo_svg-01.svg"
                alt="RAVION"
                className="h-full w-full object-contain brightness-0 invert"
              />
            </div>
            <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-[#021311]" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#c99a55]/30 bg-[#c99a55]/10 px-3.5 py-1 font-mono text-[10px] font-semibold tracking-widest text-[#d1aa6b] uppercase">
            <Sparkles className="h-2.5 w-2.5 text-[#c99a55]" />
            <span>Private Studio Portal</span>
          </div>

          <h1 className="mt-3.5 font-serif text-3xl font-bold text-[#f5f0e8] tracking-tight">
            Ravion Admin
          </h1>
          <p className="mt-1.5 text-xs text-[#f5f0e8]/60 font-sans max-w-xs mx-auto">
            Manage your Link in Bio, digital products, portfolio, and website without code.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-950/40 p-4 text-xs text-red-200 animate-in fade-in duration-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-300">Authentication Failed</p>
              <p className="mt-0.5 text-red-200/80">{error}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Address */}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 flex items-center justify-between font-mono text-[11px] font-medium tracking-wider text-[#d1aa6b] uppercase"
            >
              <span>Admin Email</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#c99a55]/60">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ruchitthakkar12@gmail.com"
                disabled={isLoading}
                className="w-full rounded-2xl border border-[#c99a55]/25 bg-[#010c0b]/80 py-3.5 pl-10 pr-4 text-xs text-[#f5f0e8] placeholder-[#f5f0e8]/25 transition-all focus:border-[#c99a55] focus:bg-[#031513] focus:outline-none focus:ring-1 focus:ring-[#c99a55]"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 flex items-center justify-between font-mono text-[11px] font-medium tracking-wider text-[#d1aa6b] uppercase"
            >
              <span>Password</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#c99a55]/60">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isLoading}
                className="w-full rounded-2xl border border-[#c99a55]/25 bg-[#010c0b]/80 py-3.5 pl-10 pr-11 text-xs text-[#f5f0e8] placeholder-[#f5f0e8]/25 transition-all focus:border-[#c99a55] focus:bg-[#031513] focus:outline-none focus:ring-1 focus:ring-[#c99a55]"
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

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#c99a55] via-[#dfb77b] to-[#b38341] py-3.5 px-6 text-xs font-bold tracking-widest text-[#031513] uppercase shadow-xl shadow-[#c99a55]/25 transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Access Admin Hub</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Security Badge */}
        <div className="mt-8 pt-6 border-t border-[#c99a55]/15 flex items-center justify-between text-[11px] font-mono text-[#f5f0e8]/40">
          <span>Protected by RAVION Shield</span>
          <span className="text-[#c99a55]/80">v2.0 · No-Code</span>
        </div>
      </div>
    </div>
  );
}
