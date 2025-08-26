import { ReactNode } from "react";
import Link from "next/link";
import "@/app/globals.css";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "100vh" }}>
      <aside style={{ borderRight: "1px solid #eee", padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>GoldBod</h2>
        <nav>
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
            <li><Link href={"/dashboard" as const}>Overview</Link></li>
            <li><Link href={"/dashboard/cases" as const}>Cases</Link></li>
            <li><Link href={"/dashboard/payments" as const}>Payments</Link></li>
            <li><Link href={"/dashboard/exports" as const}>Exports</Link></li>
            <li><Link href={"/" as const}>Valuation</Link></li>
          </ul>
        </nav>
      </aside>
      <main style={{ padding: 24 }}>{children}</main>
    </div>
  );
}
