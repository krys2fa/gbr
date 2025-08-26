import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db";

export default async function ExportsPage() {
  const session = (await getServerSession(authOptions)) as any;
  if (!session?.user) redirect("/signin");
  const role = (session.user as any)?.role;
  const allowed = ["ADMIN", "SUPERADMIN", "AGENT"];
  if (!allowed.includes(role)) redirect("/dashboard");
  const hasDb = !!process.env.DATABASE_URL;
  let exportsList: Array<{
    documentNo: string;
    destination: string;
    createdAt: Date;
  }> = [];
  if (hasDb) {
    exportsList = await prisma.export.findMany({
      select: { documentNo: true, destination: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }
  return (
    <div>
      <h1>Exports</h1>
      {!hasDb && (
        <p style={{ color: "#666" }}>
          Database not configured. Listing unavailable.
        </p>
      )}
      {hasDb && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Document No</th>
              <th align="left">Destination</th>
              <th align="left">Created</th>
            </tr>
          </thead>
          <tbody>
            {exportsList.map((e) => (
              <tr key={e.documentNo}>
                <td>{e.documentNo}</td>
                <td>{e.destination}</td>
                <td>{new Date(e.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {exportsList.length === 0 && (
              <tr>
                <td colSpan={3} style={{ color: "#666" }}>
                  No recent exports.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
