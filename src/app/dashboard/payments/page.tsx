import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function PaymentsPage() {
	const session = (await getServerSession(authOptions)) as any;
	if (!session?.user) redirect("/signin");
	const role = (session.user as any)?.role;
	const allowed = ["CASHIER", "ADMIN", "SUPERADMIN"];
	if (!allowed.includes(role)) redirect("/dashboard");
	return (
		<div>
			<h1>Payments</h1>
			<p>Record and reconcile payments for approved cases.</p>
			<p>Access for Cashiers, Admins, and Super Admins.</p>
		</div>
	);
}
