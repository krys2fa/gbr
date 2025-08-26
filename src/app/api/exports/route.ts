import { z } from "zod";
import { prisma } from "@/server/db";

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
