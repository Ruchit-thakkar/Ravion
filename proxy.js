import { NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "ravion_admin_token";

/**
 * Validates JWT token using standard Web Crypto API.
 * Runs in Next.js Proxy/Edge runtime with zero external dependencies.
 */
async function verifyWebToken(tokenStr, secretKey) {
  try {
    if (!tokenStr || typeof tokenStr !== "string") return null;
    const parts = tokenStr.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    // Decode and validate payload format & expiry
    const rawPayload = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(rawPayload);

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null; // Expired
    }

    if (payload.role !== "admin") {
      return null;
    }

    const secret = secretKey || "dev-ravion-local-secret-do-not-use-in-production";
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const data = enc.encode(`${headerB64}.${payloadB64}`);
    const sigStr = signatureB64.replace(/-/g, "+").replace(/_/g, "/");
    const pad = sigStr.length % 4 === 0 ? "" : "=".repeat(4 - (sigStr.length % 4));
    const binarySig = atob(sigStr + pad);
    const rawSig = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      rawSig[i] = binarySig.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify("HMAC", key, rawSig, data);
    return isValid ? payload : null;
  } catch {
    return null;
  }
}

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const jwtSecret = process.env.JWT_SECRET || "dev-ravion-local-secret-do-not-use-in-production";

  // Check if token is cryptographically valid
  const adminSession = token ? await verifyWebToken(token, jwtSecret) : null;

  // 1. Protect all /admin routes except /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!adminSession) {
      const loginUrl = new URL("/admin/login", request.url);
      const destination = pathname + (search || "");
      if (destination && destination !== "/admin") {
        loginUrl.searchParams.set("from", destination);
      }
      const response = NextResponse.redirect(loginUrl);
      if (token && !adminSession) {
        // Clear invalid or expired cookie
        response.cookies.delete(ADMIN_COOKIE_NAME);
      }
      return response;
    }
  }

  // 2. If already logged in with valid token and navigating to /admin/login, redirect to /admin
  if (pathname === "/admin/login" && adminSession) {
    const adminUrl = new URL("/admin", request.url);
    return NextResponse.redirect(adminUrl);
  }

  return NextResponse.next();
}

export const middleware = proxy;
export default proxy;

export const config = {
  matcher: ["/admin/:path*"],
};
