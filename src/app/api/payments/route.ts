import { z } from "zod";
import { prisma } from "@/server/db";

const PaymentSchema = z.object({
  caseRef: z.string(),
  amount: z.number().positive(),
  method: z.string().min(2),
  reference: z.string().min(2),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = PaymentSchema.parse(body);
    if (!process.env.DATABASE_URL) {
      return Response.json({ ok: true, received: parsed }, { status: 201 });
    }
    const kase = await prisma.case.findUnique({
      where: { ref: parsed.caseRef },
    });
    if (!kase)
      return Response.json({ error: "Case not found" }, { status: 404 });
    const created = await prisma.payment.create({
      data: {
        caseId: kase.id,
        amount: parsed.amount as any,
        method: parsed.method,
        reference: parsed.reference,
        status: "completed",
      },
    });
    // Optional status transition
    await prisma.case.update({
      where: { id: kase.id },
      data: { status: "PAID" as any },
    });
    return Response.json({ ok: true, id: created.id }, { status: 201 });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? "Invalid" }, { status: 400 });
  }
}
