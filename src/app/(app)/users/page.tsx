import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db";
import { UsersManager } from "./UsersManager.client";

export default async function UsersPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session?.user) redirect("/signin");
  const role = (session.user as any)?.role || "AUTHENTICATED";
  const allowed = ["ADMIN", "SUPERADMIN"];
  if (!allowed.includes(role)) redirect("/dashboard");
  const sp = searchParams || {};
  const page = Math.max(1, parseInt(String(sp.page ?? "1")) || 1);
  const pageSizeRaw = parseInt(String(sp.pageSize ?? "10")) || 10;
  const pageSize = Math.min(Math.max(pageSizeRaw, 5), 50);
  const q = (typeof sp.q === "string" ? sp.q : undefined) || "";
  const roleFilter = (typeof sp.role === "string" ? sp.role : undefined) || "";

  const hasDb = !!process.env.DATABASE_URL;
  let total = 0;
  let items: Array<{
    id: string;
    email: string;
    name: string | null;
    role: string;
    emailVerified: Date | null;
    createdAt: Date;
  }> = [];
  if (hasDb) {
    const where: any = {};
    if (q) {
      where.OR = [
        { email: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
      ];
    }
    if (roleFilter) where.role = roleFilter;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const [list, cnt] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);
    items = list as any;
    total = cnt;
  }

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (roleFilter) params.set("role", roleFilter);
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  const apiUrl = `/api/admin/users?${params.toString()}`;

  return (
    <div>
      <h1>Users</h1>
      {!hasDb && (
        <p style={{ color: "#666" }}>
          Database not configured. Listing unavailable.
        </p>
      )}
      {hasDb && (
        <UsersManager
          queryKey={[{ q, role: roleFilter, page, pageSize }]}
          apiUrl={apiUrl}
          initial={{ items: items as any, total, page, pageSize }}
        />
      )}
    </div>
  );
}
