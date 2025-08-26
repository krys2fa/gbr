import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db";

export default async function PaymentsPage() {
  const session = (await getServerSession(authOptions)) as any;
  if (!session?.user) redirect("/signin");
  const role = (session.user as any)?.role;
  const allowed = ["CASHIER", "ADMIN", "SUPERADMIN"];
  if (!allowed.includes(role)) redirect("/dashboard");
  const hasDb = !!process.env.DATABASE_URL;
  let payments: Array<{
    reference: string;
    amount: any;
    currency: string;
    createdAt: Date;
  }> = [];
  if (hasDb) {
    payments = await prisma.payment.findMany({
      select: {
        reference: true,
        amount: true,
        currency: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }
  return (
    <div>
      <h1>Payments</h1>
      {!hasDb && (
        <p style={{ color: "#666" }}>
          Database not configured. Listing unavailable.
        </p>
      )}
      {hasDb && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Reference</th>
              <th align="right">Amount</th>
              <th align="left">Currency</th>
              <th align="left">Created</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.reference}>
                <td>{p.reference}</td>
                <td style={{ textAlign: "right" }}>
                  {p.amount?.toString?.() ?? p.amount}
                </td>
                <td>{p.currency}</td>
                <td>{new Date(p.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: "#666" }}>
                  No recent payments.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
