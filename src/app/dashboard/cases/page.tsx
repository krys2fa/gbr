import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function CasesPage() {
	const session = (await getServerSession(authOptions)) as any;
	if (!session?.user) redirect("/signin");
	const role = (session.user as any)?.role;
	const allowed = ["AGENT", "ADMIN", "SUPERADMIN", "COMPANIES"];
	if (!allowed.includes(role)) redirect("/dashboard");
	return (
		<div>
			<h1>Cases</h1>
			<p>List and manage gold valuation cases.</p>
			<p>Access for Agents, Admins, Super Admins, and Companies.</p>
		</div>
	);
}
