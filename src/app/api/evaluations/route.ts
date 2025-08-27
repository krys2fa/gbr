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
  const hasDb = !!process.env.DATABASE_URL;
  if (!hasDb) return NextResponse.json({ items: [], total: 0, page, pageSize });
  const [items, total] = await (prisma as any).$transaction([
    (prisma as any).evaluation.findMany({
      select: { id: true, jobCardId: true, method: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    (prisma as any).evaluation.count(),
  ]);
  return NextResponse.json({ items, total, page, pageSize });
}
// keep POST with same imports above

const schema = z.object({
  jobCardId: z.string().min(1),
  method: z.enum(["XRAY", "WATER_DENSITY"]),
  lots: z.number().int().optional(),
  grossWeightGrams: z.union([z.number(), z.string()]).optional(),
  finenessPercent: z.union([z.number(), z.string()]).optional(),
  netWeightGrams: z.union([z.number(), z.string()]).optional(),
  netWeightOz: z.union([z.number(), z.string()]).optional(),
  certificateNo: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());
    const created = await (prisma as any).evaluation.create({ data });
    return NextResponse.json({ ok: true, id: created.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
