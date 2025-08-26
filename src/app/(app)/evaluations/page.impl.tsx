import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db";
import { CreateEvaluationForm } from "@/components/forms/CreateEvaluationForm";

export default async function EvaluationsPage({
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
    method: string;
    createdAt: Date;
  }> = [];
  if (hasDb) {
    const [rows, cnt] = await (prisma as any).$transaction([
      (prisma as any).evaluation.findMany({
        select: { id: true, jobCardId: true, method: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      (prisma as any).evaluation.count(),
    ]);
    list = rows;
    total = cnt;
  }
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const buildHref = (p: number) =>
    `/evaluations?page=${p}&pageSize=${pageSize}`;
  return (
    <div>
      <h1>Evaluations</h1>
      <CreateEvaluationForm />
      {!hasDb && <p style={{ color: "#666" }}>Database not configured.</p>}
      {hasDb && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Job</th>
              <th align="left">Method</th>
              <th align="left">Created</th>
            </tr>
          </thead>
          <tbody>
            {list.map((e) => (
              <tr key={e.id}>
                <td>{e.jobCardId}</td>
                <td>{e.method}</td>
                <td>{new Date(e.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={3} style={{ color: "#666" }}>
                  No evaluations.
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
