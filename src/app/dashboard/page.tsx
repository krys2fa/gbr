import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardHome() {
  const session = (await getServerSession(authOptions)) as any;
  if (!session?.user) redirect("/signin");
  const role = (session.user as any)?.role || "AUTHENTICATED";
  return (
    <div>
      <h1>Dashboard</h1>
      <p>
        Welcome back{session.user?.name ? `, ${session.user.name}` : ""}.
      </p>
      <p>
        Your role: <strong>{role}</strong>
      </p>
      <ul>
        <li>Cases: submit and track applications</li>
        <li>Payments: record and reconcile receipts</li>
        <li>Exports: manage export documentation</li>
      </ul>
    </div>
  );
}
 
