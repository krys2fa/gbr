import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ExportsList } from "./ExportsList.client";
import { ExportsActionsBar } from "./ActionsBar.client";

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
  const params = new URLSearchParams();
  if (documentNoQ) params.set("documentNo", documentNoQ);
  if (destQ) params.set("destination", destQ);
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  const apiUrl = `/api/exports?${params.toString()}`;
  return (
    <div>
      <ExportsActionsBar total={total} />
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
            <Button variant="glass" type="submit">
              Filter
            </Button>
          </div>
        </div>
        <input type="hidden" name="page" value="1" />
      </form>
      {/* Forms moved to modal in ActionsBar */}
      {!hasDb && (
        <p style={{ color: "#666" }}>
          Database not configured. Listing unavailable.
        </p>
      )}
      {hasDb && (
        <ExportsList
          queryKey={[{ documentNoQ, destQ, page, pageSize }]}
          apiUrl={apiUrl}
          initial={{ items: exportsList as any, total, page, pageSize }}
        />
      )}
    </div>
  );
}
