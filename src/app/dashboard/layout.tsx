import { ReactNode } from "react";
import type { Route } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardChrome } from "@/components/dashboard/Chrome";
import { Home, Briefcase, CreditCard, Truck, Sparkles } from "lucide-react";

type DashboardRoute =
  | "/dashboard"
  | "/dashboard/cases"
  | "/dashboard/payments"
  | "/dashboard/exports"
  | "/";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = (await getServerSession(authOptions)) as any;
  const role: string = (session?.user as any)?.role ?? "ANON";
  const iconProps = { size: 18, strokeWidth: 2 };
  const items = (
    [
      {
        href: "/dashboard" as Route,
        label: "Overview",
        icon: <Home {...iconProps} />,
      },
      {
        href: "/cases" as Route,
        label: "Cases",
        icon: <Briefcase {...iconProps} />,
        roles: [
          "COMPANIES",
          "AGENT",
          "ADMIN",
          "SUPERADMIN",
          "TECHNICAL_DIRECTOR",
        ],
      },
      {
        href: "/payments" as Route,
        label: "Payments",
        icon: <CreditCard {...iconProps} />,
        roles: ["CASHIER", "ADMIN", "SUPERADMIN"],
      },
      {
        href: "/exports" as Route,
        label: "Exports",
        icon: <Truck {...iconProps} />,
        roles: [
          "AGENT",
          "ADMIN",
          "SUPERADMIN",
          "CUSTOMS_OFFICER",
          "TECHNICAL_DIRECTOR",
          "EXPORTER",
        ],
      },
      {
        href: "/" as Route,
        label: "Valuation",
        icon: <Sparkles {...iconProps} />,
      },
    ] as const
  ).filter(
    (i) => !("roles" in i) || (i as any).roles?.includes(role)
  ) as Array<{ href: Route; label: string; icon?: React.ReactNode }>;

  return (
    <DashboardChrome user={session?.user} role={role} items={items}>
      {children}
    </DashboardChrome>
  );
}
