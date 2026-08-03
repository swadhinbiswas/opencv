import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session-constants";

/**
 * Lightweight route guard. Only checks for cookie *presence* — the real
 * verification happens in server components and route handlers via
 * `getSession()`. Kept dependency-free so it runs on the edge.
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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  // Allow authenticated users into their app, and send visitors to /dashboard.
  if (isProtected && !hasSession) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (hasSession && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
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