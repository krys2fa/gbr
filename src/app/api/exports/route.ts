import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1") || 1);
  const pageSize = Math.min(
    Math.max(parseInt(url.searchParams.get("pageSize") || "10") || 10, 5),
    50
  );
  const documentNoQ = url.searchParams.get("documentNo") || undefined;
  const destQ = url.searchParams.get("destination") || undefined;
  const hasDb = !!process.env.DATABASE_URL;
  if (!hasDb) return NextResponse.json({ items: [], total: 0, page, pageSize });
  const where: any = {};
  if (documentNoQ)
    where.documentNo = { contains: documentNoQ, mode: "insensitive" };
  if (destQ) where.destination = { contains: destQ, mode: "insensitive" };
  const [items, total] = await (prisma as any).$transaction([
    (prisma as any).export.findMany({
      where,
      select: { documentNo: true, destination: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    (prisma as any).export.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, pageSize });
}
import { z } from "zod";

const CreateExportSchema = z.object({
  caseRef: z.string().min(3),
  documentNo: z.string().min(2),
  destination: z.string().min(2),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateExportSchema.parse(body);
    if (!process.env.DATABASE_URL) {
      return Response.json(
        { ok: false, error: "Database not configured" },
        { status: 503 }
      );
    }

    const kase = await prisma.case.findUnique({
      where: { ref: parsed.caseRef },
    });
    if (!kase) {
      return Response.json(
        { ok: false, error: "Case not found" },
        { status: 404 }
      );
    }

    const created = await prisma.export.create({
      data: {
        caseId: kase.id,
        documentNo: parsed.documentNo,
        destination: parsed.destination,
      },
    });

    // Optionally update case status
    await prisma.case.update({
      where: { id: kase.id },
      data: { status: "EXPORTED" as any },
    });

    return Response.json(
      { ok: true, export: { id: created.id, documentNo: created.documentNo } },
      { status: 201 }
    );
  } catch (e: any) {
    return Response.json({ error: e?.message ?? "Invalid" }, { status: 400 });
  }
}
