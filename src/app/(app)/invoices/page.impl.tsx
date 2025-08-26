import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db";
import { CreateInvoiceForm } from "@/components/forms/CreateInvoiceForm";

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
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (invoiceNoQ) params.set("invoiceNo", invoiceNoQ);
    params.set("page", String(p));
    params.set("pageSize", String(pageSize));
    return `/invoices?${params.toString()}`;
  };
  return (
    <div>
      <h1>Invoices</h1>
      <CreateInvoiceForm />
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
            <button className="btn-glass btn-inline" type="submit">
              Filter
            </button>
          </div>
        </div>
        <input type="hidden" name="page" value="1" />
      </form>
      {!hasDb && <p style={{ color: "#666" }}>Database not configured.</p>}
      {hasDb && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Invoice No</th>
              <th align="right">Amount</th>
              <th align="left">Created</th>
              <th align="left">Print</th>
            </tr>
          </thead>
          <tbody>
            {list.map((i) => (
              <tr key={i.invoiceNo}>
                <td>{i.invoiceNo}</td>
                <td style={{ textAlign: "right" }}>
                  {i.amount?.toString?.() ?? i.amount}
                </td>
                <td>{new Date(i.createdAt).toLocaleString()}</td>
                <td>
                  <Link href={`/invoice/${i.id}` as any} prefetch={false}>
                    Print
                  </Link>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: "#666" }}>
                  No invoices.
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
