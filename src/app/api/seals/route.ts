import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";

const schema = z.object({
  jobCardId: z.string().min(1),
  customsName: z.string().min(1),
  customsNumber: z.string().min(1),
  securitySealNumbers: z.string().min(1),
  pmmcSealNo: z.string().min(1),
  assayCertificateNumber: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());
    const created = await (prisma as any).seal.create({ data });
    return NextResponse.json({ ok: true, id: created.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
