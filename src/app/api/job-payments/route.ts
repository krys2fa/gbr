import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";

const schema = z.object({
  jobCardId: z.string().min(1),
  amount: z.union([z.number(), z.string()]),
  currency: z.string().default("USD"),
  method: z.string().min(1),
  reference: z.string().min(3),
  receiptNo: z.string().optional(),
  receiptUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());
    const created = await (prisma as any).jobPayment.create({ data });
    return NextResponse.json({
      ok: true,
      id: created.id,
      reference: created.reference,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
