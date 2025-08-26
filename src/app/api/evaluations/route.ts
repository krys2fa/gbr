import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";

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
