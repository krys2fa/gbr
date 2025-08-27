import { ReactNode } from "react";
import type { Route } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardChrome } from "@/components/dashboard/Chrome";
import {
  Home,
  ClipboardList,
  FlaskConical,
  FileText,
  CreditCard,
  Shield,
  Settings,
  BarChart3,
  Users,
} from "lucide-react";

export default async function AppLayout({ children }: { children: ReactNode }) {
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
        href: "/job-cards" as Route,
        label: "Job Cards",
        icon: <ClipboardList {...iconProps} />,
      },
      {
        href: "/evaluations" as Route,
        label: "Evaluations",
        icon: <FlaskConical {...iconProps} />,
      },
      {
        href: "/invoices" as Route,
        label: "Invoices",
        icon: <FileText {...iconProps} />,
      },
      {
        href: "/payments" as Route,
        label: "Payments",
        icon: <CreditCard {...iconProps} />,
        roles: ["CASHIER", "ADMIN", "SUPERADMIN"],
      },
      {
        href: "/reports" as Route,
        label: "Reports",
        icon: <BarChart3 {...iconProps} />,
        roles: ["ADMIN", "SUPERADMIN", "TECHNICAL_DIRECTOR"],
      },
      {
        href: "/users" as Route,
        label: "Users",
        icon: <Users {...iconProps} />,
        roles: ["ADMIN", "SUPERADMIN"],
      },
      {
        href: "/seals" as Route,
        label: "Seals",
        icon: <Shield {...iconProps} />,
      },
      {
        href: "/settings" as Route,
        label: "Settings",
        icon: <Settings {...iconProps} />,
        roles: ["ADMIN", "SUPERADMIN"],
      },
    ] as const
  ).filter(
    (i) => !("roles" in i) || (i as any).roles?.includes(role)
  ) as Array<{
    href: Route;
    label: string;
    icon?: React.ReactNode;
  }>;

  return (
    <DashboardChrome user={session?.user} role={role} items={items}>
      {children}
    </DashboardChrome>
  );
}
