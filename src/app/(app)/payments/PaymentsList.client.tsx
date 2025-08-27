"use client";
import { useMemo } from "react";
import { useRQ, fetchJSON } from "@/lib/rq";
import { LinkButton } from "@/components/ui/LinkButton";

type PaymentRow = {
  reference: string;
  amount: any;
  currency: string;
  createdAt: string | Date;
};

type PaymentsResponse = {
  items: PaymentRow[];
  total: number;
  page: number;
  pageSize: number;
};

export function PaymentsList({
  queryKey,
  apiUrl,
  initial,
}: {
  queryKey: any[];
  apiUrl: string;
  initial: PaymentsResponse;
}) {
  const { data } = useRQ<PaymentsResponse>(
    ["payments", ...queryKey],
    () => fetchJSON<PaymentsResponse>(apiUrl),
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
              <th align="left">Reference</th>
              <th align="right">Amount</th>
              <th align="left">Currency</th>
              <th align="left">Created</th>
            </tr>
          </thead>
          <tbody>
            {d?.items?.map?.((p) => (
              <tr key={p.reference}>
                <td>{p.reference}</td>
                <td style={{ textAlign: "right" }}>
                  {p.amount?.toString?.() ?? p.amount}
                </td>
                <td>{p.currency}</td>
                <td>{new Date(p.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {!d?.items?.length && (
              <tr>
                <td colSpan={4} style={{ color: "#666" }}>
                  No recent payments.
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
            Page {d?.page ?? 1} of {totalPages} ({d?.total ?? 0} total)
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <LinkButton href={prevHref} aria-disabled={(d?.page ?? 1) <= 1}>
              Prev
            </LinkButton>
            <LinkButton
              href={nextHref}
              aria-disabled={(d?.page ?? 1) >= totalPages}
            >
              Next
            </LinkButton>
          </div>
        </div>
      </div>
    </>
  );
}
