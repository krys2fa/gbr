import { prisma } from "@/server/db";
import Image from "next/image";
import Link from "next/link";

export default async function InvoicePrintPage({
  params,
}: {
  params: { id: string };
}) {
  const inv = await (prisma as any).invoice.findUnique({
    where: { id: params.id },
    include: { jobCard: true },
  });
  if (!inv)
    return (
      <div className="sheet">
        <h1>Invoice</h1>
        <p className="muted">Not found.</p>
      </div>
    );
  return (
    <div className="sheet">
      <div
        className="no-print"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Link href="/invoices">Back</Link>
        <button onClick={() => window.print()} className="btn-glass">
          Print
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Image
          src="/goldbod-logo.webp"
          alt="GoldBod"
          width={28}
          height={28}
          style={{ borderRadius: 6 }}
        />
        <h1 style={{ margin: 0 }}>Invoice</h1>
      </div>
      <p className="muted">Invoice ID: {inv.id}</p>
      <hr />
      <div className="row">
        <strong>Invoice No</strong>
        <div>{inv.invoiceNo}</div>
      </div>
      <div className="row">
        <strong>Date</strong>
        <div>{new Date(inv.createdAt).toLocaleString()}</div>
      </div>
      <div className="row">
        <strong>Amount</strong>
        <div>
          {inv.amount?.toString?.() ?? inv.amount} {inv.currency}
        </div>
      </div>
      <hr />
      <h3>Job Card</h3>
      <div className="row">
        <strong>Reference</strong>
        <div>{inv.jobCard?.ref}</div>
      </div>
      <div className="row">
        <strong>Buyer</strong>
        <div>{inv.jobCard?.buyerName}</div>
      </div>
      <div className="row">
        <strong>Destination</strong>
        <div>{inv.jobCard?.destinationCountry}</div>
      </div>
    </div>
  );
}
