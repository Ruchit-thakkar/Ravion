"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validate redirect destination to prevent open-redirect vulnerabilities
  const rawFrom = searchParams.get("from");
  const targetDestination =
    rawFrom && rawFrom.startsWith("/admin") && !rawFrom.startsWith("/admin/login")
      ? rawFrom
      : "/admin";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your admin email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed. Please verify your credentials.");
      }

      // Hard navigation ensures server cookies and middleware states are instantly acknowledged
      window.location.href = targetDestination;
    } catch (err) {
      setError(err.message || "An error occurred during login. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-center bg-[#f5f0e8] px-4 py-12 sm:px-6 lg:px-8">
      {/* Background ambient accents matching Ravion palette */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-[#c99a55]/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-[#082d2a]/5 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-[440px]">
        {/* Main Card */}
        <div className="rounded-3xl border border-[#082d2a]/12 bg-white/85 p-7 sm:p-10 shadow-xl backdrop-blur-md">
          {/* Brand Logo & Eyebrow */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-block transition-transform duration-300 hover:scale-105"
              aria-label="Ravion Homepage"
            >
              <img
                src="/assets/ravion_logo_svg-01.svg"
                alt="Ravion"
                className="logo-img mx-auto h-9 w-auto"
              />
            </Link>

            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[#c99a55]/35 bg-[#c99a55]/10 px-3 py-1 font-mono text-[10.5px] font-medium tracking-widest text-[#8b714e] uppercase">
              <ShieldCheck size={12} className="text-[#c99a55]" />
              <span>PRIVATE ACCESS • ADMIN PORTAL</span>
            </div>

            <h1 className="mt-4 font-serif text-3xl font-medium tracking-tight text-[#082d2a] sm:text-4xl">
              Welcome <em className="font-serif italic font-normal text-[#c99a55]">back.</em>
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-[#082d2a]/70">
              Sign in with your authorized administrator credentials to manage your digital space.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="mt-7 space-y-4.5" noValidate>
            {/* Error Message Alert */}
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-xs text-red-800 animate-in fade-in duration-200"
              >
                <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-600" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="admin-email"
                className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase"
              >
                Admin Email *
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#082d2a]/45">
                  <Mail size={15} />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="admin@ravion.in"
                  disabled={loading}
                  className="w-full rounded-xl border border-[#082d2a]/15 bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55] disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="admin-password"
                className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase"
              >
                Password *
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#082d2a]/45">
                  <Lock size={15} />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="••••••••••••"
                  disabled={loading}
                  className="w-full rounded-xl border border-[#082d2a]/15 bg-white pl-10 pr-11 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55] disabled:cursor-not-allowed disabled:bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#082d2a]/50 hover:text-[#082d2a] transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-full bg-[#082d2a] px-6 py-3.5 text-sm font-medium text-[#f5f0e8] shadow-md transition-all duration-300 hover:bg-[#c99a55] hover:text-[#031513] hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying Credentials…</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin</span>
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Back Link */}
          <div className="mt-8 border-t border-[#082d2a]/10 pt-5 text-center">
            <Link
              href="/"
              className="group inline-flex items-center gap-1.5 font-mono text-xs text-[#082d2a]/65 transition-colors hover:text-[#082d2a]"
            >
              <ArrowLeft
                size={13}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
              <span>Return to Ravion website</span>
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <p className="mt-6 text-center font-mono text-[11px] text-[#082d2a]/55">
          Ravion Protected Environment • Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}
