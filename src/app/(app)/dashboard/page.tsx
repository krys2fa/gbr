import { redirect } from "next/navigation";
import styles from "./page.module.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  ClipboardList,
  FlaskConical,
  FileText,
  CreditCard,
  Shield,
} from "lucide-react";
import {
  PipelineChart,
  PaymentsChart,
} from "@/components/charts/DashboardCharts";
import { RouteToaster } from "@/components/RouteToaster";

function lastNWeeks(n: number) {
  const arr: { label: string; date: Date }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const lab = `${d.getMonth() + 1}/${d.getDate()}`;
    arr.push({ label: lab, date: d });
  }
  return arr;
}

function genDummyCounts(len: number, base: number, variance = 4) {
  const out: number[] = [];
  let val = base;
  for (let i = 0; i < len; i++) {
    const delta = ((i * 9301 + base * 49297) % 17) - 8;
    val = Math.max(0, val + Math.round(delta / 3));
    out.push(val);
  }
  return out;
}

export default async function DashboardHome() {
  const session = (await getServerSession(authOptions)) as any;
  if (!session?.user) redirect("/signin");
  const role = (session.user as any)?.role || "AUTHENTICATED";
  const userName = (session.user as any)?.name || null;

  const weeks = lastNWeeks(8);
  const labels = weeks.map((w) => w.label);
  const jobCards = genDummyCounts(weeks.length, 8, 5);
  const evaluations = genDummyCounts(weeks.length, 5, 5);
  const invoices = genDummyCounts(weeks.length, 4, 5);
  const seals = genDummyCounts(weeks.length, 3, 4);

  const pipeline = labels.map((label, i) => ({
    label,
    jobCards: jobCards[i],
    evaluations: evaluations[i],
  }));

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const now = new Date();
  const last6 = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - (5 - i));
    return `${monthNames[d.getMonth()]}`;
  });
  const payments = genDummyCounts(6, 12, 7).map(
    (v, i) => v * (i % 3 === 0 ? 2 : 1)
  );
  const paymentsData = last6.map((label, i) => ({ label, value: payments[i] }));

  const totals = {
    jobCards: jobCards.reduce((a, b) => a + b, 0),
    evaluations: evaluations.reduce((a, b) => a + b, 0),
    invoices: invoices.reduce((a, b) => a + b, 0),
    payments: payments.reduce((a, b) => a + b, 0),
    seals: seals.reduce((a, b) => a + b, 0),
  };

  return (
    <div>
      <RouteToaster signedIn userName={userName} />
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.subtle}>
            Welcome back{session.user?.name ? `, ${session.user.name}` : ""}.
            Role: <strong>{role}</strong>
          </p>
        </div>
      </div>

      <div className={styles.gridLayout}>
        <main className={styles.mainCol}>
          <div className={styles.chartCard + " glass"}>
            <div className={styles.cardHead}>
              <strong>Pipeline (last 8 weeks)</strong>
              <div className={styles.legend}>
                <span className={styles.dotBrand} /> Job Cards
                <span className={styles.dotBrand2} /> Evaluations
              </div>
            </div>
            <PipelineChart data={pipeline} />
          </div>

          <div className={styles.chartCard + " glass"}>
            <div className={styles.cardHead}>
              <strong>Payments by month</strong>
            </div>
            <PaymentsChart data={paymentsData} />
          </div>
        </main>

        <aside className={styles.asideCol}>
          <div className={styles.gridStats}>
            <div className={`glass ${styles.cardStat}`}>
              <div className={styles.rowSmall}>
                <ClipboardList size={16} />
                <span className={styles.cardLabel}>Job Cards</span>
              </div>
              <div className={styles.cardValue}>{totals.jobCards}</div>
              <div className={styles.cardHint}>Created (8 weeks)</div>
            </div>
            <div className={`glass ${styles.cardStat}`}>
              <div className={styles.rowSmall}>
                <FlaskConical size={16} />
                <span className={styles.cardLabel}>Evaluations</span>
              </div>
              <div className={styles.cardValue}>{totals.evaluations}</div>
              <div className={styles.cardHint}>Completed (8 weeks)</div>
            </div>
            <div className={`glass ${styles.cardStat}`}>
              <div className={styles.rowSmall}>
                <FileText size={16} />
                <span className={styles.cardLabel}>Invoices</span>
              </div>
              <div className={styles.cardValue}>{totals.invoices}</div>
              <div className={styles.cardHint}>Issued (8 weeks)</div>
            </div>
            <div className={`glass ${styles.cardStat}`}>
              <div className={styles.rowSmall}>
                <CreditCard size={16} />
                <span className={styles.cardLabel}>Payments</span>
              </div>
              <div className={styles.cardValue}>{totals.payments}</div>
              <div className={styles.cardHint}>Total index (6 months)</div>
            </div>
            <div className={`glass ${styles.cardStat}`}>
              <div className={styles.rowSmall}>
                <Shield size={16} />
                <span className={styles.cardLabel}>Seals</span>
              </div>
              <div className={styles.cardValue}>{totals.seals}</div>
              <div className={styles.cardHint}>Created (8 weeks)</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
