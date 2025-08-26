import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";

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
