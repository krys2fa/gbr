import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";

const rowSchema = z.object({
  ref: z.string().min(1),
  exporterType: z
    .enum(["GOLDBOD", "THIRD_PARTY", "COMPANY", "INDIVIDUAL"])
    .optional()
    .default("GOLDBOD"),
  exporterName: z.string().optional().default("GOLDBOD"),
  buyerName: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().min(1),
  tinNumber: z.string().min(1),
  destinationCountry: z.string().min(1),
  deliveryLocation: z.string().min(1),
  consignee: z.string().min(1),
  notifiedParty: z.string().min(1),
  numberOfBoxes: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  airwayBill: z.string().min(1),
  countryOfOrigin: z.string().optional().default("Ghana"),
  exporterReference: z.string().min(1),
  usdPrice: z.union([z.number(), z.string()]).transform((v) => String(v)),
  totalWeight: z.union([z.number(), z.string()]).transform((v) => String(v)),
  purityPercent: z.union([z.number(), z.string()]).transform((v) => String(v)),
});

const payloadSchema = z.object({ rows: z.array(rowSchema).min(1) });

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { rows } = payloadSchema.parse(json);

    // Use createMany with skipDuplicates on unique ref
    const created = await (prisma as any).jobCard.createMany({
      data: rows.map((r) => ({
        ref: r.ref,
        exporterType: r.exporterType,
        exporterName: r.exporterName,
        buyerName: r.buyerName,
        phone: r.phone,
        address: r.address,
        tinNumber: r.tinNumber,
        destinationCountry: r.destinationCountry,
        deliveryLocation: r.deliveryLocation,
        consignee: r.consignee,
        notifiedParty: r.notifiedParty,
        numberOfBoxes: Number(r.numberOfBoxes || 1),
        airwayBill: r.airwayBill,
        countryOfOrigin: r.countryOfOrigin || "Ghana",
        exporterReference: r.exporterReference,
        usdPrice: String(r.usdPrice || "0"),
        totalWeight: String(r.totalWeight || "0"),
        purityPercent: String(r.purityPercent || "0"),
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({ ok: true, count: created.count });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Invalid payload" },
      { status: 400 }
    );
  }
}
