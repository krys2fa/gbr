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
  const refQ = url.searchParams.get("ref") || undefined;
  const buyerQ = url.searchParams.get("buyer") || undefined;
  const hasDb = !!process.env.DATABASE_URL;
  if (!hasDb) return NextResponse.json({ items: [], total: 0, page, pageSize });
  const where: any = {};
  if (refQ) where.ref = { contains: refQ, mode: "insensitive" };
  if (buyerQ) where.buyerName = { contains: buyerQ, mode: "insensitive" };
  const [items, total] = await (prisma as any).$transaction([
    (prisma as any).jobCard.findMany({
      where,
      select: { ref: true, buyerName: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    (prisma as any).jobCard.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, pageSize });
}

const schema = z.object({
  ref: z.string().min(3),
  exporterType: z
    .enum(["GOLDBOD", "THIRD_PARTY", "COMPANY", "INDIVIDUAL"])
    .default("GOLDBOD"),
  exporterName: z.string().min(1).default("GOLDBOD"),
  buyerName: z.string().min(1),
  phone: z.string().min(3),
  address: z.string().min(1),
  tinNumber: z.string().min(1),
  destinationCountry: z.string().min(1),
  deliveryLocation: z.string().min(1),
  consignee: z.string().min(1),
  notifiedParty: z.string().min(1),
  numberOfBoxes: z.number().int().positive(),
  airwayBill: z.string().min(1),
  countryOfOrigin: z.string().min(1).default("Ghana"),
  exporterReference: z.string().min(1),
  usdPrice: z.union([z.number(), z.string()]),
  totalWeight: z.union([z.number(), z.string()]),
  purityPercent: z.union([z.number(), z.string()]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const created = await (prisma as any).jobCard.create({
      data: {
        ref: data.ref,
        exporterType: data.exporterType,
        exporterName: data.exporterName,
        buyerName: data.buyerName,
        phone: data.phone,
        address: data.address,
        tinNumber: data.tinNumber,
        destinationCountry: data.destinationCountry,
        deliveryLocation: data.deliveryLocation,
        consignee: data.consignee,
        notifiedParty: data.notifiedParty,
        numberOfBoxes: data.numberOfBoxes,
        airwayBill: data.airwayBill,
        countryOfOrigin: data.countryOfOrigin,
        exporterReference: data.exporterReference,
        usdPrice: data.usdPrice,
        totalWeight: data.totalWeight,
        purityPercent: data.purityPercent,
      },
    });
    return NextResponse.json({ ok: true, id: created.id, ref: created.ref });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
