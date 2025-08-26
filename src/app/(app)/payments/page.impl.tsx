import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db";
import Link from "next/link";
import { CreatePaymentForm } from "@/components/forms/CreatePaymentForm";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session?.user) redirect("/signin");
  const role = (session.user as any)?.role;
  const allowed = ["CASHIER", "ADMIN", "SUPERADMIN"];
  if (!allowed.includes(role)) redirect("/dashboard");
  const hasDb = !!process.env.DATABASE_URL;
  const sp = searchParams || {};
  const page = Math.max(1, parseInt(String(sp.page ?? "1")) || 1);
  const pageSizeRaw = parseInt(String(sp.pageSize ?? "10")) || 10;
  const pageSize = Math.min(Math.max(pageSizeRaw, 5), 50);
  const referenceQ =
    (typeof sp.reference === "string" ? sp.reference : undefined) || undefined;
  const currencyQ =
    (typeof sp.currency === "string" ? sp.currency : undefined) || undefined;

  let total = 0;
  let payments: Array<{
    reference: string;
    amount: any;
    currency: string;
    createdAt: Date;
  }> = [];
  if (hasDb) {
    const where: any = {};
    if (referenceQ)
      where.reference = { contains: referenceQ, mode: "insensitive" };
    if (currencyQ) where.currency = { equals: currencyQ };
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const [list, cnt] = await prisma.$transaction([
      prisma.payment.findMany({
        where,
        select: {
          reference: true,
          amount: true,
          currency: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.payment.count({ where }),
    ]);
    payments = list;
    total = cnt;
  }
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (referenceQ) params.set("reference", referenceQ);
    if (currencyQ) params.set("currency", currencyQ);
    params.set("page", String(p));
    params.set("pageSize", String(pageSize));
    return `/payments?${params.toString()}`;
  };
  return (
    <div>
      <h1>Payments</h1>
      <form
        method="GET"
        className="glass"
        style={{ padding: 12, margin: "12px 0" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0,1fr))",
            gap: 8,
          }}
        >
          <label>
            Reference
            <input
              className="input"
              name="reference"
              defaultValue={referenceQ}
            />
          </label>
          <label>
            Currency
            <input className="input" name="currency" defaultValue={currencyQ} />
          </label>
          <label>
            Page size
            <select
              className="input"
              name="pageSize"
              defaultValue={String(pageSize)}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </label>
          <div style={{ alignSelf: "end" }}>
            <button className="btn-glass btn-inline" type="submit">
              Filter
            </button>
          </div>
        </div>
        <input type="hidden" name="page" value="1" />
      </form>
      <CreatePaymentForm />
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
      {hasDb && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 12,
          }}
        >
          <div>
            Page {page} of {totalPages} ({total} total)
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link
              className="btn-glass btn-inline"
              href={buildHref(Math.max(1, page - 1)) as any}
              aria-disabled={page <= 1}
            >
              Prev
            </Link>
            <Link
              className="btn-glass btn-inline"
              href={buildHref(Math.min(totalPages, page + 1)) as any}
              aria-disabled={page >= totalPages}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
