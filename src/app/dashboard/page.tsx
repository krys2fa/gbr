import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardHome() {
  const session = (await getServerSession(authOptions)) as any;
  if (!session?.user) redirect("/signin");
  const role = (session.user as any)?.role || "AUTHENTICATED";
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <p>Welcome back{session.user?.name ? `, ${session.user.name}` : ""}.</p>
      <p>
        Your role: <strong>{role}</strong>
      </p>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", marginTop: 16 }}>
        {[
          { label: "Cases", value: "–", hint: "Total open" },
          { label: "Payments", value: "–", hint: "Last 7 days" },
          { label: "Exports", value: "–", hint: "Pending" },
          { label: "Valuations", value: "–", hint: "Today" },
        ].map((c) => (
          <div key={c.label} className="glass" style={{ padding: 16, borderRadius: 16, transition: "transform .15s, box-shadow .15s" }}>
            <div style={{ fontSize: 12, color: "var(--ink-dim)", marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{c.value}</div>
            <div style={{ fontSize: 12, color: "var(--ink-dim)", marginTop: 4 }}>{c.hint}</div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .glass:hover{ box-shadow: 0 12px 32px rgba(15,23,42,.12); transform: translateY(-1px); }
        @media (prefers-reduced-motion: reduce){
          .glass:hover{ transform: none; box-shadow: 0 8px 24px var(--glass-shadow); }
        }
      `}</style>
    </div>
  );
}
