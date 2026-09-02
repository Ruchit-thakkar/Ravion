import { NextResponse } from "next/server";

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("ravion_admin_token")?.value;

  // Protect /admin routes (excluding /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in and visiting /admin/login, redirect to /admin
  if (pathname === "/admin/login" && token) {
    const adminUrl = new URL("/admin", request.url);
    return NextResponse.redirect(adminUrl);
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/admin/:path*"],
};
