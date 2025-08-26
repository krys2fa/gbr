import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ExportsPage() {
	const session = (await getServerSession(authOptions)) as any;
	if (!session?.user) redirect("/signin");
	const role = (session.user as any)?.role;
	const allowed = ["ADMIN", "SUPERADMIN", "AGENT"];
	if (!allowed.includes(role)) redirect("/dashboard");
	return (
		<div>
			<h1>Exports</h1>
			<p>Manage export documentation and status.</p>
			<p>Access for Agents, Admins, and Super Admins.</p>
		</div>
	);
}
