import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { JobCardsList } from "./JobCardsList.client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db";
import { JobCardsActionsBar } from "./ActionsBar.client";

export default async function JobCardsPage({
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
  const refQ = typeof sp.ref === "string" ? sp.ref : undefined;
  const buyerQ = typeof sp.buyer === "string" ? sp.buyer : undefined;
  const where: any = {};
  if (refQ) where.ref = { contains: refQ, mode: "insensitive" };
  if (buyerQ) where.buyerName = { contains: buyerQ, mode: "insensitive" };
  let total = 0;
  if (hasDb) {
    // Only count for header stats; defer list fetching to the client for faster navigation.
    total = await (prisma as any).jobCard.count({ where });
  }
  const params = new URLSearchParams();
  if (refQ) params.set("ref", refQ);
  if (buyerQ) params.set("buyer", buyerQ);
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  const apiUrl = `/api/job-cards?${params.toString()}`;
  return (
    <div>
      <JobCardsActionsBar total={total} />
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
            Ref
            <input className="input" name="ref" defaultValue={refQ} />
          </label>
          <label>
            Buyer
            <input className="input" name="buyer" defaultValue={buyerQ} />
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
            <Button variant="glass" type="submit">
              Filter
            </Button>
          </div>
        </div>
        <input type="hidden" name="page" value="1" />
      </form>

      {/* TODO: Add CreateJobCardForm with excel upload */}
      {!hasDb && <p style={{ color: "#666" }}>Database not configured.</p>}
      {hasDb && (
        <JobCardsList
          queryKey={[{ refQ, buyerQ, page, pageSize }]}
          apiUrl={apiUrl}
        />
      )}
    </div>
  );
}
