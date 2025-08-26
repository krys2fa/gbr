import { z } from "zod";
import { prisma } from "@/server/db";

const AssayCertificateSchema = z.object({
  exportDocumentNo: z.string().optional(),
  lots: z.number().int().min(0).optional(),
  grossWeightGrams: z.number().nonnegative(),
  finenessPercent: z.number().min(0).max(100),
  netWeightGrams: z.number().nonnegative(),
  netWeightOz: z.number().nonnegative(),
  customsSealNo: z.string().optional(),
  pmmcSealNo: z.string().optional(),
  otherSealNo: z.string().optional(),
  certificateNo: z.string().min(3),
  date: z.coerce.date(),
  client: z.string(),
  reference: z.string(),
  exporter: z.string(),
});

export async function POST(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }
    const body = await req.json();
    const parsed = AssayCertificateSchema.parse(body);

    let exportId: string | undefined;
    if (parsed.exportDocumentNo) {
      const exp = await prisma.export.findFirst({
        where: { documentNo: parsed.exportDocumentNo },
        select: { id: true },
      });
      if (!exp)
        return Response.json({ error: "Export not found" }, { status: 404 });
      exportId = exp.id;
    }

    const created = await (prisma as any).assayCertificate.create({
      data: {
        lots: parsed.lots ?? null,
        grossWeightGrams: parsed.grossWeightGrams as any,
        finenessPercent: parsed.finenessPercent as any,
        netWeightGrams: parsed.netWeightGrams as any,
        netWeightOz: parsed.netWeightOz as any,
        customsSealNo: parsed.customsSealNo ?? null,
        pmmcSealNo: parsed.pmmcSealNo ?? null,
        otherSealNo: parsed.otherSealNo ?? null,
        certificateNo: parsed.certificateNo,
        date: parsed.date,
        client: parsed.client,
        reference: parsed.reference,
        exporter: parsed.exporter,
        exportId: exportId ?? null,
      },
    });

    return Response.json({ ok: true, id: created.id }, { status: 201 });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? "Invalid" }, { status: 400 });
  }
}
