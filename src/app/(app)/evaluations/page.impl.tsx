import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db";
import { EvaluationsList } from "./EvaluationsList.client";
import { EvaluationsActionsBar } from "./ActionsBar.client";

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
  const apiUrl = `/api/evaluations?page=${page}&pageSize=${pageSize}`;
  return (
    <div>
      <EvaluationsActionsBar total={total} />
      {!hasDb && <p style={{ color: "#666" }}>Database not configured.</p>}
      {hasDb && (
        <EvaluationsList
          queryKey={[{ page, pageSize }]}
          apiUrl={apiUrl}
          initial={{ items: list as any, total, page, pageSize }}
        />
      )}
    </div>
  );
}
