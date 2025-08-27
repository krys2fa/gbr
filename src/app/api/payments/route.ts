import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1") || 1);
  const pageSize = Math.min(
    Math.max(parseInt(url.searchParams.get("pageSize") || "10") || 10, 5),
    50
  );
  const referenceQ = url.searchParams.get("reference") || undefined;
  const currencyQ = url.searchParams.get("currency") || undefined;

  const hasDb = !!process.env.DATABASE_URL;
  if (!hasDb) {
    return NextResponse.json({ items: [], total: 0, page, pageSize });
  }
  const where: any = {};
  if (referenceQ)
    where.reference = { contains: referenceQ, mode: "insensitive" };
  if (currencyQ) where.currency = { equals: currencyQ };
  const skip = (page - 1) * pageSize;
  const take = pageSize;
  const [items, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where,
      select: {
        reference: true,
        amount: true,
        currency: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.payment.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, pageSize });
}
import { z } from "zod";

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
