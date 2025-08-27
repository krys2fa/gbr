import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight session presence check using the next-auth session cookie.
// This avoids a full server call for speed: we only redirect when no session cookie is present.
// Note: This does not validate the token; API routes and pages must still protect data server-side.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow Next.js internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/valuation") // allow public calc if needed
  ) {
    return NextResponse.next();
  }

  // Root is hard-redirected in app/page.tsx; no work needed here

  // For app routes under /(app) that require auth, do a fast cookie check.
  const isProtected = [
    "/dashboard",
    "/job-cards",
    "/evaluations",
    "/invoices",
    "/payments",
    "/exports",
    "/seals",
    "/users",
  ].some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!isProtected) return NextResponse.next();

  // next-auth default cookie names for JWT strategy: next-auth.session-token
  // In production it becomes __Secure-next-auth.session-token
  const sessionCookie =
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!sessionCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|favicon).*)"],
};
