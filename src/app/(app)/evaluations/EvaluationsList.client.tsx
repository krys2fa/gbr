"use client";
import { useMemo } from "react";
import { useRQ, fetchJSON } from "@/lib/rq";
import { LinkButton } from "@/components/ui/LinkButton";

type Row = {
  id: string;
  jobCardId: string;
  method: string;
  createdAt: string | Date;
};
type Resp = { items: Row[]; total: number; page: number; pageSize: number };

export function EvaluationsList({
  queryKey,
  apiUrl,
  initial,
}: {
  queryKey: any[];
  apiUrl: string;
  initial: Resp;
}) {
  const { data, isFetching } = useRQ<Resp>(
    ["evaluations", ...queryKey],
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
              <th align="left">Job</th>
              <th align="left">Method</th>
              <th align="left">Created</th>
            </tr>
          </thead>
          <tbody>
            {d?.items?.map?.((e) => (
              <tr key={e.id}>
                <td>{e.jobCardId}</td>
                <td>{e.method}</td>
                <td>{new Date(e.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {!d?.items?.length && (
              <tr>
                <td colSpan={3} style={{ color: "#666" }}>
                  No evaluations.
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
