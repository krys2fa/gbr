"use client";
import { useMemo } from "react";
import { useRQ, fetchJSON } from "@/lib/rq";
import { LinkButton } from "@/components/ui/LinkButton";
import { useQueryClient } from "@tanstack/react-query";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

type Row = {
  ref: string;
  buyerName: string;
  status: string;
  createdAt: string | Date;
};
type Resp = { items: Row[]; total: number; page: number; pageSize: number };

export function JobCardsList({
  queryKey,
  apiUrl,
  initial,
}: {
  queryKey: any[];
  apiUrl: string;
  initial?: Resp;
}) {
  const key = ["job-cards", ...queryKey] as const;
  const { data, isFetching, status } = useRQ<Resp>(
    key,
    () => fetchJSON<Resp>(apiUrl),
    initial
      ? { initialData: initial, staleTime: 20_000 }
      : { staleTime: 20_000 }
  );
  const d = data ?? initial;
  const totalPages = Math.max(
    1,
    Math.ceil((d?.total ?? 0) / (d?.pageSize ?? 10))
  );
  const qc = useQueryClient();
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
  const prevApi = useMemo(() => {
    const u = new URL(apiUrl, "http://local");
    const p = Math.max(1, (d?.page ?? 1) - 1);
    u.searchParams.set("page", String(p));
    return u.pathname + "?" + u.searchParams.toString();
  }, [apiUrl, d?.page]);
  const nextApi = useMemo(() => {
    const u = new URL(apiUrl, "http://local");
    const p = Math.min(totalPages, (d?.page ?? 1) + 1);
    u.searchParams.set("page", String(p));
    return u.pathname + "?" + u.searchParams.toString();
  }, [apiUrl, d?.page, totalPages]);
  const prefetch = (url: string, pageNum: number) =>
    qc.prefetchQuery({
      queryKey: ["job-cards", { ...(queryKey?.[0] || {}), page: pageNum }],
      queryFn: () => fetchJSON<Resp>(url),
      staleTime: 20_000,
    });
  if (!d) {
    return <TableSkeleton rows={8} columns={4} />;
  }
  return (
    <>
      <div
        className="glass glass-table"
        style={{ padding: 12, borderRadius: 12 }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Ref</th>
              <th align="left">Buyer</th>
              <th align="left">Status</th>
              <th align="left">Created</th>
            </tr>
          </thead>
          <tbody>
            {d?.items?.map?.((j) => (
              <tr key={j.ref}>
                <td>{j.ref}</td>
                <td>{j.buyerName}</td>
                <td>{j.status}</td>
                <td>{new Date(j.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {!d?.items?.length && (
              <tr>
                <td colSpan={4} style={{ color: "#666" }}>
                  No matching jobs.
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
            <LinkButton
              href={prevHref}
              onMouseEnter={() =>
                prefetch(prevApi, Math.max(1, (d?.page ?? 1) - 1))
              }
            >
              Prev
            </LinkButton>
            <LinkButton
              href={nextHref}
              onMouseEnter={() =>
                prefetch(nextApi, Math.min(totalPages, (d?.page ?? 1) + 1))
              }
            >
              Next
            </LinkButton>
          </div>
        </div>
      </div>
    </>
  );
}
