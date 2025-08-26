import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db";
import { CreateSealForm } from "@/components/forms/CreateSealForm";

export default async function SealsPage({
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
  let total = 0;
  let list: Array<{
    id: string;
    jobCardId: string;
    customsName: string;
    pmmcSealNo: string;
    createdAt: Date;
  }> = [];
  if (hasDb) {
    const [rows, cnt] = await (prisma as any).$transaction([
      (prisma as any).seal.findMany({
        select: {
          id: true,
          jobCardId: true,
          customsName: true,
          pmmcSealNo: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      (prisma as any).seal.count(),
    ]);
    list = rows;
    total = cnt;
  }
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const buildHref = (p: number) => `/seals?page=${p}&pageSize=${pageSize}`;
  return (
    <div>
      <h1>Seals</h1>
      <CreateSealForm />
      {!hasDb && <p style={{ color: "#666" }}>Database not configured.</p>}
      {hasDb && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Job</th>
              <th align="left">Customs</th>
              <th align="left">PMMC Seal</th>
              <th align="left">Created</th>
              <th align="left">Print</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s, idx) => (
              <tr key={`${s.jobCardId}-${idx}`}>
                <td>{s.jobCardId}</td>
                <td>{s.customsName}</td>
                <td>{s.pmmcSealNo}</td>
                <td>{new Date(s.createdAt).toLocaleString()}</td>
                <td>
                  <Link href={`/seal/${s.id}` as any} prefetch={false}>
                    Print
                  </Link>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} style={{ color: "#666" }}>
                  No seals.
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
