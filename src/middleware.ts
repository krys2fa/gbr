import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Very light stub for RBAC. In production, replace with Auth.js/Clerk and JWTs.
// For now, accept header: Authorization: Role <ROLE_NAME>
const PUBLIC_PATHS = ["/", "/signin", "/api/valuation"];

const ROLE_PATH_RULES: Array<{ path: RegExp; roles: string[] }> = [
  { path: /^\/api\/cases/i, roles: ["AGENT", "ADMIN", "SUPERADMIN"] },
  { path: /^\/api\/payments/i, roles: ["CASHIER", "ADMIN", "SUPERADMIN"] },
  { path: /^\/api\/admin/i, roles: ["ADMIN", "SUPERADMIN"] },
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  if (pathname.startsWith("/api/auth")) return NextResponse.next();
  const rule = ROLE_PATH_RULES.find((r) => r.path.test(pathname));
  if (!rule) return NextResponse.next();

  const auth = req.headers.get("authorization") || "";
  let role = auth.startsWith("Role ") ? auth.substring(5).toUpperCase() : "";
  // Try read next-auth session cookie for database sessions
  const cookie =
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;
  if (cookie) {
    // We aren't verifying here to keep it lightweight; server routes should re-check.
    // Presence implies authenticated; role must still be provided via server-side session checks.
    // Middleware only blocks obviously unauthorized access if no role is present.
    role = role || "AUTHENTICATED";
  }
  if (!role || !rule.roles.includes(role)) {
    return new NextResponse(
      JSON.stringify({ error: "Forbidden: insufficient role" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\.png$).*)"],
};
