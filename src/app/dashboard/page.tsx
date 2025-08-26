import { redirect } from "next/navigation";
import styles from "./page.module.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardHome() {
  const session = (await getServerSession(authOptions)) as any;
  if (!session?.user) redirect("/signin");
  const role = (session.user as any)?.role || "AUTHENTICATED";
  return (
    <div>
      <h1 className={styles.pageTitle}>Dashboard</h1>
      <p>Welcome back{session.user?.name ? `, ${session.user.name}` : ""}.</p>
      <p>
        Your role: <strong>{role}</strong>
      </p>

      <div className={styles.gridStats}>
        {[
          { label: "Cases", value: "–", hint: "Total open" },
          { label: "Payments", value: "–", hint: "Last 7 days" },
          { label: "Exports", value: "–", hint: "Pending" },
          { label: "Valuations", value: "–", hint: "Today" },
        ].map((c) => (
          <div key={c.label} className={`glass sheen-card ${styles.cardStat}`}>
            <div className={styles.cardLabel}>{c.label}</div>
            <div className={styles.cardValue}>{c.value}</div>
            <div className={styles.cardHint}>{c.hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
