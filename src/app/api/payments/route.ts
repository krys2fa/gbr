import { z } from 'zod';

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
    // TODO: persist via Prisma and update case status; webhook-friendly design later
    return Response.json({ ok: true, received: parsed }, { status: 201 });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? 'Invalid' }, { status: 400 });
  }
}
