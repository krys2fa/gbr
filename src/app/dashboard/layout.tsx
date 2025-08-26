import { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import "@/app/globals.css";

type DashboardRoute =
  | "/dashboard"
  | "/dashboard/cases"
  | "/dashboard/payments"
  | "/dashboard/exports"
  | "/";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = (await getServerSession(authOptions)) as any;
  const role: string = (session?.user as any)?.role ?? "ANON";
  const items: Array<{ href: DashboardRoute; label: string; roles?: string[] }> = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/cases", label: "Cases", roles: ["COMPANIES", "AGENT", "ADMIN", "SUPERADMIN"] },
    { href: "/dashboard/payments", label: "Payments", roles: ["CASHIER", "ADMIN", "SUPERADMIN"] },
    { href: "/dashboard/exports", label: "Exports", roles: ["AGENT", "ADMIN", "SUPERADMIN"] },
    { href: "/", label: "Valuation" },
  ];
  const visible = items.filter((i) => !i.roles || i.roles.includes(role));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "100vh" }}>
      <aside style={{ borderRight: "1px solid #eee", padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>GoldBod</h2>
        <nav>
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
            {visible.map((i) => (
              <li key={i.href}>
                <Link href={i.href}>{i.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main style={{ padding: 24 }}>{children}</main>
    </div>
  );
}
