import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ReportsPage() {
  const session = (await getServerSession(authOptions)) as any;
  if (!session?.user) redirect("/signin");
  const role = (session.user as any)?.role || "AUTHENTICATED";
  const allowed = ["ADMIN", "SUPERADMIN", "TECHNICAL_DIRECTOR"];
  if (!allowed.includes(role)) redirect("/dashboard");
  return (
    <div>
      <h1>Reports</h1>
      <p style={{ color: "#666" }}>Reporting dashboards will appear here.</p>
    </div>
  );
}
