import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Admin Sign In — RAVION",
  description: "Secure administrative access for RAVION Studio.",
};

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();

  // If already authenticated, redirect to /admin/bio directly
  if (admin && admin.role === "admin") {
    redirect("/admin/bio");
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-[#02100e] px-4 py-12 selection:bg-[#c99a55] selection:text-[#031513] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_70%_at_50%_0%,rgba(201,154,85,0.18),transparent)]" />
      <div className="fixed bottom-0 left-0 right-0 h-96 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(6,38,35,0.8),transparent)]" />

      {/* Grid Pattern Accent */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,154,85,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,154,85,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <LoginForm />
    </main>
  );
}
