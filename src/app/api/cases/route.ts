import { z } from "zod";
import { prisma } from "@/server/db";
import { valuationUSD } from "@/lib/valuation";

const CreateCaseSchema = z.object({
  applicantEmail: z.string().email(),
  karat: z.number().min(8).max(24),
  weightGrams: z.number().positive(),
  impuritiesPct: z.number().min(0).max(20).default(0),
});

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const parsed = CreateCaseSchema.parse(data);
    // If DB is configured, persist. Otherwise, return mock ref for demo.
    const hasDb = !!process.env.DATABASE_URL;
    if (hasDb) {
      const user = await prisma.user.upsert({
        where: { email: parsed.applicantEmail },
        update: {},
        create: { email: parsed.applicantEmail, role: 'COMPANIES' as any },
      });
      const value = valuationUSD({ karat: parsed.karat, weightGrams: parsed.weightGrams, impuritiesPct: parsed.impuritiesPct }).net;
      const ref = `GB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const created = await prisma.case.create({
        data: {
          ref,
          applicantId: user.id,
          status: 'SUBMITTED',
          items: { create: [{ karat: parsed.karat, weightGrams: parsed.weightGrams, impurities: parsed.impuritiesPct, valuation: Number(value.toFixed(2)) }] },
        },
      });
      return Response.json({ ref: created.ref, status: created.status }, { status: 201 });
    }
    const ref = `GB-${Date.now().toString(36).toUpperCase()}`;
    return Response.json({ ref, status: "SUBMITTED" }, { status: 201 });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? "Invalid" }, { status: 400 });
  }
}
