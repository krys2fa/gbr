import { ReactNode } from "react";
import type { Route } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardChrome } from "@/components/dashboard/Chrome";

type DashboardRoute =
  | "/dashboard"
  | "/dashboard/cases"
  | "/dashboard/payments"
  | "/dashboard/exports"
  | "/";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = (await getServerSession(authOptions)) as any;
  const role: string = (session?.user as any)?.role ?? "ANON";
  const items = (
    [
      { href: "/dashboard" as Route, label: "Overview", icon: iconHome() },
      { href: "/dashboard/cases" as Route, label: "Cases", icon: iconCase() , roles: ["COMPANIES", "AGENT", "ADMIN", "SUPERADMIN"]},
      { href: "/dashboard/payments" as Route, label: "Payments", icon: iconCreditCard(), roles: ["CASHIER", "ADMIN", "SUPERADMIN"] },
      { href: "/dashboard/exports" as Route, label: "Exports", icon: iconTruck(), roles: ["AGENT", "ADMIN", "SUPERADMIN"] },
      { href: "/" as Route, label: "Valuation", icon: iconSparkle() },
    ] as const
  ).filter((i) => !("roles" in i) || (i as any).roles?.includes(role)) as Array<{ href: Route; label: string; icon?: React.ReactNode }>;

  return (
    <DashboardChrome user={session?.user} role={role} items={items}>
      {children}
    </DashboardChrome>
  );
}

function iconHome(){
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-6 9 6"/><path d="M9 22V12h6v10"/></svg>);
}
function iconCase(){
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>);
}
function iconCreditCard(){
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>);
}
function iconTruck(){
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17h4"/><path d="M3 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/><path d="M3 17V7a2 2 0 0 1 2-2h9v12"/><path d="M21 17v-6h-4"/></svg>);
}
function iconSparkle(){
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.5 4.5L19 10l-4.5 2.5L12 17l-2.5-4.5L5 10l4.5-2.5L12 3z"/></svg>);
}
