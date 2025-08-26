import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db";
import { CreateCaseForm } from "@/components/forms/CreateCaseForm";

export default async function CasesPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session?.user) redirect("/signin");
  const role = (session.user as any)?.role;
  const allowed = [
    "AGENT",
    "ADMIN",
    "SUPERADMIN",
    "COMPANIES",
    "TECHNICAL_DIRECTOR",
  ];
  if (!allowed.includes(role)) redirect("/dashboard");
  const hasDb = !!process.env.DATABASE_URL;
  const sp = searchParams || {};
  const page = Math.max(1, parseInt(String(sp.page ?? "1")) || 1);
  const pageSizeRaw = parseInt(String(sp.pageSize ?? "10")) || 10;
  const pageSize = Math.min(Math.max(pageSizeRaw, 5), 50);
  const refQ = (typeof sp.ref === "string" ? sp.ref : undefined) || undefined;
  const statusQ =
    (typeof sp.status === "string" ? sp.status : undefined) || undefined;

  let total = 0;
  let cases: Array<{ ref: string; status: string; createdAt: Date }> = [];
  if (hasDb) {
    const where: any = {};
    if (refQ) where.ref = { contains: refQ, mode: "insensitive" };
    if (statusQ) where.status = statusQ as any;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const [list, cnt] = await prisma.$transaction([
      prisma.case.findMany({
        where,
        select: { ref: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.case.count({ where }),
    ]);
    cases = list;
    total = cnt;
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (refQ) params.set("ref", refQ);
    if (statusQ) params.set("status", statusQ);
    params.set("page", String(p));
    params.set("pageSize", String(pageSize));
    return `/cases?${params.toString()}`;
  };
  return (
    <div>
      <h1>Cases</h1>
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
            Status
            <select
              className="input"
              name="status"
              defaultValue={statusQ ?? ""}
            >
              <option value="">Any</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="EVALUATED">EVALUATED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="PAID">PAID</option>
              <option value="EXPORTED">EXPORTED</option>
            </select>
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
      <CreateCaseForm />
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
