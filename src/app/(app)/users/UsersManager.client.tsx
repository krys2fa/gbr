"use client";
import { useMemo, useRef, useState } from "react";
import { useRQ, fetchJSON } from "@/lib/rq";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { notify } from "@/lib/notify";
import { Pencil, KeyRound, UserX, Users as UsersIcon } from "lucide-react";

type Row = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  emailVerified: string | Date | null;
  createdAt: string | Date;
};
type Resp = { items: Row[]; total: number; page: number; pageSize: number };

const ROLE_OPTIONS = [
  "ADMIN",
  "SUPERADMIN",
  "CASHIER",
  "AGENT",
  "TECHNICAL_DIRECTOR",
  "CUSTOMS_OFFICER",
  "EXPORTER",
  "COMPANIES",
] as const;

export function UsersManager({
  queryKey,
  apiUrl,
  initial,
}: {
  queryKey: any[];
  apiUrl: string;
  initial: Resp;
}) {
  const { data, refetch, isFetching } = useRQ<Resp>(
    ["users", ...queryKey],
    () => fetchJSON<Resp>(apiUrl),
    { initialData: initial, staleTime: 20_000 }
  );
  const d = data ?? initial;
  const totalPages = Math.max(
    1,
    Math.ceil((d?.total ?? 0) / (d?.pageSize ?? 10))
  );

  // Modal state
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Debounced search
  const initQ = useMemo(
    () => new URL(apiUrl, "http://local").searchParams.get("q") || "",
    [apiUrl]
  );
  const [qText, setQText] = useState(initQ);
  const deb = useRef<number | null>(null);

  const pagePath = useMemo(() => {
    const u = new URL(apiUrl, "http://local");
    const path = u.pathname;
    if (path.startsWith("/api/admin/users")) return "/users";
    return path.replace(/^\/api/, "");
  }, [apiUrl]);
  const prevHref = useMemo(() => {
    const u = new URL(apiUrl, "http://local");
    const p = Math.max(1, (d?.page ?? 1) - 1);
    u.searchParams.set("page", String(p));
    return pagePath + "?" + u.searchParams.toString();
  }, [apiUrl, d?.page, pagePath]);
  const nextHref = useMemo(() => {
    const u = new URL(apiUrl, "http://local");
    const p = Math.min(totalPages, (d?.page ?? 1) + 1);
    u.searchParams.set("page", String(p));
    return pagePath + "?" + u.searchParams.toString();
  }, [apiUrl, d?.page, totalPages, pagePath]);

  const exportCSV = () => {
    const rows = d?.items ?? [];
    const header = ["Email", "Name", "Role", "Verified", "CreatedAt"];
    const esc = (v: any) => {
      const s = String(v ?? "");
      if (/[",\n]/.test(s)) return '"' + s.replaceAll('"', '""') + '"';
      return s;
    };
    const body = rows.map((r) =>
      [
        r.email,
        r.name ?? "",
        r.role,
        r.emailVerified ? "Yes" : "No",
        new Date(r.createdAt).toISOString(),
      ]
        .map(esc)
        .join(",")
    );
    const csv = [header.join(","), ...body].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `users_export_page_${d?.page ?? 1}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const roleChip = (role: string) => {
    const bg =
      role === "SUPERADMIN"
        ? "#7c3aed" // violet-600
        : role === "ADMIN"
        ? "#2563eb" // blue-600
        : role === "CASHIER"
        ? "#059669" // emerald-600
        : role === "TECHNICAL_DIRECTOR"
        ? "#0ea5e9" // sky-500
        : role === "CUSTOMS_OFFICER"
        ? "#f59e0b" // amber-500
        : role === "EXPORTER"
        ? "#9333ea" // purple-600
        : role === "COMPANIES"
        ? "#db2777" // pink-600
        : "#64748b"; // slate-500
    return (
      <span
        style={{
          display: "inline-block",
          padding: "2px 8px",
          borderRadius: 999,
          background: bg,
          color: "#fff",
          fontSize: 12,
          lineHeight: 1.6,
          boxShadow: "0 1px 6px rgba(0,0,0,.18)",
        }}
      >
        {role}
      </span>
    );
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div
          className="glass"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 12,
          }}
        >
          <UsersIcon size={18} />
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ fontWeight: 600, lineHeight: 1 }}>Users</div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 6,
                lineHeight: 1,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 18 }}>
                {d?.total ?? 0}
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                Total
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={exportCSV} variant="glass">
            Export CSV
          </Button>
          <Button onClick={() => setOpen(true)} variant="primary">
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
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
            Search
            <input
              className="input"
              name="q"
              value={qText}
              onChange={(e) => {
                const val = e.target.value;
                setQText(val);
                if (deb.current) window.clearTimeout(deb.current);
                deb.current = window.setTimeout(() => {
                  const u = new URL(apiUrl, "http://local");
                  u.searchParams.set("q", val);
                  u.searchParams.set("page", "1");
                  window.location.href =
                    pagePath + "?" + u.searchParams.toString();
                }, 400);
              }}
            />
          </label>
          <label>
            Role
            <select
              className="input"
              name="role"
              defaultValue={
                new URL(apiUrl, "http://local").searchParams.get("role") || ""
              }
            >
              <option value="">All</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label>
            Page size
            <select
              className="input"
              name="pageSize"
              defaultValue={String(d?.pageSize ?? 10)}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </label>
          <div style={{ alignSelf: "end" }}>
            <Button type="submit" variant="glass">
              Filter
            </Button>
          </div>
        </div>
        <input type="hidden" name="page" value="1" />
      </form>

      {/* Table */}
      <div
        className="glass glass-table"
        style={{ padding: 12, borderRadius: 12 }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Email</th>
              <th align="left">Name</th>
              <th align="left">Role</th>
              <th align="left">Verified</th>
              <th align="left">Created</th>
              <th align="left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {d?.items?.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.name || "—"}</td>
                <td>{roleChip(u.role)}</td>
                <td>{u.emailVerified ? "Yes" : "No"}</td>
                <td>{new Date(u.createdAt).toLocaleString()}</td>
                <td>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Button
                      variant="glass"
                      size="sm"
                      title="Edit user"
                      aria-label="Edit user"
                      leftIcon={<Pencil size={14} />}
                      onClick={() => notify.info("Edit user", u.email)}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      title="Reset password"
                      aria-label="Reset password"
                      leftIcon={<KeyRound size={14} />}
                      onClick={() =>
                        notify.info("Reset password", "Not implemented yet")
                      }
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      title="Deactivate"
                      aria-label="Deactivate user"
                      leftIcon={<UserX size={14} />}
                      onClick={() =>
                        notify.info("Deactivate user", "Not implemented yet")
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
            {!d?.items?.length && (
              <tr>
                <td colSpan={6} style={{ color: "#666" }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Pager */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 12,
          }}
        >
          <div>
            Page {d?.page ?? 1} of {totalPages} ({d?.total ?? 0} total)
            {isFetching ? " …" : ""}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <LinkButton href={prevHref}>Prev</LinkButton>
            <LinkButton href={nextHref}>Next</LinkButton>
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="glass"
          style={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "rgba(0,0,0,.25)",
          }}
        >
          <div
            className="glass"
            style={{ width: "min(560px, 92vw)", padding: 16, borderRadius: 12 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <strong>Add User</strong>
              <button
                aria-label="Close"
                onClick={() => setOpen(false)}
                style={{
                  border:
                    "1px solid color-mix(in oklab, var(--danger), black 18%)",
                  background: "var(--danger)",
                  color: "#fff",
                  padding: 6,
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const p = Object.fromEntries(fd.entries());
                setCreating(true);
                setErr(null);
                try {
                  const res = await fetch("/api/admin/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: p.email,
                      name: p.name,
                      role: p.role,
                      password: p.password,
                    }),
                  });
                  const json = await res.json();
                  if (!res.ok)
                    throw new Error(json.error || "Failed to create user");
                  notify.success(
                    "User created",
                    String(json?.user?.email || "")
                  );
                  setOpen(false);
                  await refetch();
                } catch (e: any) {
                  setErr(e.message);
                  notify.error("Create failed", e.message);
                } finally {
                  setCreating(false);
                }
              }}
            >
              <div style={{ display: "grid", gap: 8 }}>
                <label>
                  Email
                  <input className="input" type="email" name="email" required />
                </label>
                <label>
                  Name
                  <input className="input" name="name" />
                </label>
                <label>
                  Role
                  <select className="input" name="role" defaultValue="ADMIN">
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Password
                  <input
                    className="input"
                    type="password"
                    name="password"
                    required
                    minLength={6}
                  />
                </label>
              </div>
              {err && (
                <div style={{ color: "crimson", marginTop: 8 }}>{err}</div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  marginTop: 12,
                }}
              >
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating…" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
