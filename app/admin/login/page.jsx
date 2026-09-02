import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Admin Login — RAVION",
  description: "Secure administrative access for RAVION.",
};

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();

  // If already authenticated, redirect to /admin
  if (admin && admin.role === "admin") {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#031513] px-4 py-12 selection:bg-[#c99a55] selection:text-[#031513]">
      {/* Background aesthetics */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(201,154,85,0.15),rgba(255,255,255,0))]" />
      <LoginForm />
    </main>
  );
}
