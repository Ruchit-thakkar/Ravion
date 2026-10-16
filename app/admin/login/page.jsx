import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Login — Ravion",
  description: "Authorized administrative access for Ravion management.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage({ searchParams }) {
  // If administrator is already authenticated, redirect directly to /admin
  const admin = await getCurrentAdmin();
  if (admin && admin.role === "admin") {
    redirect("/admin");
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f5f0e8]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#082d2a] border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
