import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db";

export default async function CasesPage() {
  const session = (await getServerSession(authOptions)) as any;
  if (!session?.user) redirect("/signin");
  const role = (session.user as any)?.role;
  const allowed = ["AGENT", "ADMIN", "SUPERADMIN", "COMPANIES"];
  if (!allowed.includes(role)) redirect("/dashboard");
  const hasDb = !!process.env.DATABASE_URL;
  let cases: Array<{ ref: string; status: string; createdAt: Date }> = [];
  if (hasDb) {
    cases = await prisma.case.findMany({
      select: { ref: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }
  return (
    <div>
      <h1>Cases</h1>
      {!hasDb && (
        <p style={{ color: "#666" }}>
          Database not configured. Listing unavailable.
        </p>
      )}
      {hasDb && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Ref</th>
              <th align="left">Status</th>
              <th align="left">Created</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.ref}>
                <td>{c.ref}</td>
                <td>{c.status}</td>
                <td>{new Date(c.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {cases.length === 0 && (
              <tr>
                <td colSpan={3} style={{ color: "#666" }}>
                  No recent cases.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
