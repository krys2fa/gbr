import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db";
import Link from "next/link";
import { CreateExportForm } from "@/components/forms/CreateExportForm";
import { CreateAssayCertificateForm } from "@/components/forms/CreateAssayCertificateForm";

export default async function ExportsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session?.user) redirect("/signin");
  const role = (session.user as any)?.role;
  const allowed = [
    "ADMIN",
    "SUPERADMIN",
    "AGENT",
    "CUSTOMS_OFFICER",
    "TECHNICAL_DIRECTOR",
    "EXPORTER",
  ];
  if (!allowed.includes(role)) redirect("/dashboard");
  const hasDb = !!process.env.DATABASE_URL;
  const sp = searchParams || {};
  const page = Math.max(1, parseInt(String(sp.page ?? "1")) || 1);
  const pageSizeRaw = parseInt(String(sp.pageSize ?? "10")) || 10;
  const pageSize = Math.min(Math.max(pageSizeRaw, 5), 50);
  const documentNoQ =
    (typeof sp.documentNo === "string" ? sp.documentNo : undefined) ||
    undefined;
  const destQ =
    (typeof sp.destination === "string" ? sp.destination : undefined) ||
    undefined;

  let total = 0;
  let exportsList: Array<{
    documentNo: string;
    destination: string;
    createdAt: Date;
  }> = [];
  if (hasDb) {
    const where: any = {};
    if (documentNoQ)
      where.documentNo = { contains: documentNoQ, mode: "insensitive" };
    if (destQ) where.destination = { contains: destQ, mode: "insensitive" };
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const [list, cnt] = await prisma.$transaction([
      prisma.export.findMany({
        where,
        select: { documentNo: true, destination: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.export.count({ where }),
    ]);
    exportsList = list;
    total = cnt;
  }
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (documentNoQ) params.set("documentNo", documentNoQ);
    if (destQ) params.set("destination", destQ);
    params.set("page", String(p));
    params.set("pageSize", String(pageSize));
    return `/exports?${params.toString()}`;
  };
  return (
    <div>
      <h1>Exports</h1>
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
            Document No
            <input
              className="input"
              name="documentNo"
              defaultValue={documentNoQ}
            />
          </label>
          <label>
            Destination
            <input className="input" name="destination" defaultValue={destQ} />
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
      <CreateExportForm />
      <CreateAssayCertificateForm />
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
