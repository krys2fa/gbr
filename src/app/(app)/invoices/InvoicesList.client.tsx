"use client";
import { useMemo } from "react";
import { useRQ, fetchJSON } from "@/lib/rq";
import { LinkButton } from "@/components/ui/LinkButton";
import Link from "next/link";

type Row = {
  id: string;
  invoiceNo: string;
  amount: any;
  createdAt: string | Date;
};
type Resp = { items: Row[]; total: number; page: number; pageSize: number };

export function InvoicesList({
  queryKey,
  apiUrl,
  initial,
}: {
  queryKey: any[];
  apiUrl: string;
  initial: Resp;
}) {
  const { data, isFetching } = useRQ<Resp>(
    ["invoices", ...queryKey],
    () => fetchJSON<Resp>(apiUrl),
    { initialData: initial, staleTime: 20_000 }
  );
  const d = data ?? initial;
  const totalPages = Math.max(
    1,
    Math.ceil((d?.total ?? 0) / (d?.pageSize ?? 10))
  );
  const prevHref = useMemo(() => {
    const u = new URL(apiUrl, "http://local");
    const p = Math.max(1, (d?.page ?? 1) - 1);
    u.searchParams.set("page", String(p));
    return u.pathname.replace(/^\/api/, "") + "?" + u.searchParams.toString();
  }, [apiUrl, d?.page]);
  const nextHref = useMemo(() => {
    const u = new URL(apiUrl, "http://local");
    const p = Math.min(totalPages, (d?.page ?? 1) + 1);
    u.searchParams.set("page", String(p));
    return u.pathname.replace(/^\/api/, "") + "?" + u.searchParams.toString();
  }, [apiUrl, d?.page, totalPages]);
  return (
    <>
      <div
        className="glass glass-table"
        style={{ padding: 12, borderRadius: 12 }}
      >
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
            {d?.items?.map?.((i) => (
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
            {!d?.items?.length && (
              <tr>
                <td colSpan={4} style={{ color: "#666" }}>
                  No invoices.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 12,
          }}
        >
          <div>
            Page {d?.page ?? 1} of {totalPages} ({d?.total ?? 0} total){" "}
            {isFetching ? "…" : ""}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <LinkButton href={prevHref}>Prev</LinkButton>
            <LinkButton href={nextHref}>Next</LinkButton>
          </div>
        </div>
      </div>
    </>
  );
}
