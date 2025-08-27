import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1") || 1);
  const pageSize = Math.min(
    Math.max(parseInt(url.searchParams.get("pageSize") || "10") || 10, 5),
    50
  );
  const invoiceNoQ = url.searchParams.get("invoiceNo") || undefined;
  const hasDb = !!process.env.DATABASE_URL;
  if (!hasDb) return NextResponse.json({ items: [], total: 0, page, pageSize });
  const where: any = {};
  if (invoiceNoQ)
    where.invoiceNo = { contains: invoiceNoQ, mode: "insensitive" };
  const skip = (page - 1) * pageSize;
  const take = pageSize;
  const [items, total] = await (prisma as any).$transaction([
    (prisma as any).invoice.findMany({
      where,
      select: { id: true, invoiceNo: true, amount: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    (prisma as any).invoice.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, pageSize });
}

const createSchema = z.object({
  jobCardId: z.string().min(1),
  invoiceNo: z.string().min(3),
  amount: z.union([z.number(), z.string()]),
  currency: z.string().default("USD"),
});

export async function POST(req: NextRequest) {
  try {
    const data = createSchema.parse(await req.json());
    const created = await (prisma as any).invoice.create({ data });
    return NextResponse.json({
      ok: true,
      id: created.id,
      invoiceNo: created.invoiceNo,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
