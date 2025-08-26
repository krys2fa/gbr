import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db";
import { CreateJobCardForm } from "@/components/forms/CreateJobCardForm";

export default async function JobCardsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session?.user) redirect("/signin");
  const hasDb = !!process.env.DATABASE_URL;
  const sp = searchParams || {};
  const page = Math.max(1, parseInt(String(sp.page ?? "1")) || 1);
  const pageSize = Math.min(
    Math.max(parseInt(String(sp.pageSize ?? "10")) || 10, 5),
    50
  );
  const refQ = typeof sp.ref === "string" ? sp.ref : undefined;
  const buyerQ = typeof sp.buyer === "string" ? sp.buyer : undefined;
  const where: any = {};
  if (refQ) where.ref = { contains: refQ, mode: "insensitive" };
  if (buyerQ) where.buyerName = { contains: buyerQ, mode: "insensitive" };
  let total = 0;
  let jobs: Array<{
    ref: string;
    buyerName: string;
    status: string;
    createdAt: Date;
  }> = [];
  if (hasDb) {
    const [list, cnt] = await (prisma as any).$transaction([
      (prisma as any).jobCard.findMany({
        where,
        select: { ref: true, buyerName: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      (prisma as any).jobCard.count({ where }),
    ]);
    jobs = list as any;
    total = cnt;
  }
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (refQ) params.set("ref", refQ);
    if (buyerQ) params.set("buyer", buyerQ);
    params.set("page", String(p));
    params.set("pageSize", String(pageSize));
    return `/job-cards?${params.toString()}`;
  };
  return (
    <div>
      <h1>Job Cards</h1>
      <CreateJobCardForm />
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
            Ref
            <input className="input" name="ref" defaultValue={refQ} />
          </label>
          <label>
            Buyer
            <input className="input" name="buyer" defaultValue={buyerQ} />
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

      {/* TODO: Add CreateJobCardForm with excel upload */}
      {!hasDb && <p style={{ color: "#666" }}>Database not configured.</p>}
      {hasDb && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Ref</th>
              <th align="left">Buyer</th>
              <th align="left">Status</th>
              <th align="left">Created</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.ref}>
                <td>{j.ref}</td>
                <td>{j.buyerName}</td>
                <td>{j.status}</td>
                <td>{new Date(j.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: "#666" }}>
                  No matching jobs.
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
            >
              Prev
            </Link>
            <Link
              className="btn-glass btn-inline"
              href={buildHref(Math.min(totalPages, page + 1)) as any}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
