import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE, sessionSecret } from "@/lib/auth/session-constants";

/**
 * Route guard. Verifies the session cookie signature here so a stale or
 * tampered cookie is cleared instead of looping /login <-> /dashboard
 * (the layout would reject it, the proxy would bounce it back).
 */
const PROTECTED = [
  "/dashboard",
  "/profile",
  "/cv",
  "/cover-letters",
  "/jobs",
  "/settings",
  "/onboarding",
  "/print",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const rawCookie = request.cookies.get(SESSION_COOKIE)?.value;

  let hasSession = false;
  if (rawCookie) {
    try {
      await jwtVerify(rawCookie, new TextEncoder().encode(sessionSecret()), {
        algorithms: ["HS256"],
        issuer: "opencv",
      });
      hasSession = true;
    } catch {
      // Stale, expired or forged cookie — clear it below so the guard doesn't
      // ping-pong between /login and /dashboard.
    }
  }

  let response: NextResponse;
  // Allow authenticated users into their app, and send visitors to /dashboard.
  if (isProtected && !hasSession) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    response = NextResponse.redirect(login);
  } else if (hasSession && (pathname === "/login" || pathname === "/signup")) {
    response = NextResponse.redirect(new URL("/dashboard", request.url));
  } else {
    response = NextResponse.next();
  }

  if (rawCookie && !hasSession) {
    response.cookies.delete(SESSION_COOKIE);
  }
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/cv/:path*",
    "/jobs/:path*",
    "/cover-letters/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/print/:path*",
    "/login",
    "/signup",
  ],
};