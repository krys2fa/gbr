import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InvoicesList } from "./InvoicesList.client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db";
import { InvoicesActionsBar } from "./ActionsBar.client";

export default async function InvoicesPage({
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
  const invoiceNoQ =
    typeof sp.invoiceNo === "string" ? sp.invoiceNo : undefined;
  let total = 0;
  let list: Array<{
    id: string;
    invoiceNo: string;
    amount: any;
    createdAt: Date;
  }> = [];
  if (hasDb) {
    const where: any = {};
    if (invoiceNoQ)
      where.invoiceNo = { contains: invoiceNoQ, mode: "insensitive" };
    const [rows, cnt] = await (prisma as any).$transaction([
      (prisma as any).invoice.findMany({
        where,
        select: { id: true, invoiceNo: true, amount: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      (prisma as any).invoice.count({ where }),
    ]);
    list = rows;
    total = cnt;
  }
  const params = new URLSearchParams();
  if (invoiceNoQ) params.set("invoiceNo", invoiceNoQ);
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  const apiUrl = `/api/invoices?${params.toString()}`;
  return (
    <div>
      <InvoicesActionsBar total={total} />
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
            Invoice No
            <input
              className="input"
              name="invoiceNo"
              defaultValue={invoiceNoQ}
            />
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
      {hasDb && (
        <InvoicesList
          queryKey={[{ invoiceNoQ, page, pageSize }]}
          apiUrl={apiUrl}
          initial={{ items: list as any, total, page, pageSize }}
        />
      )}
    </div>
  );
}
