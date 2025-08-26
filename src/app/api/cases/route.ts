import { z } from "zod";

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
    // TODO: Insert into DB using Prisma. For MVP demo, return a mock reference.
    const ref = `GB-${Date.now().toString(36).toUpperCase()}`;
    return Response.json({ ref, status: "SUBMITTED" }, { status: 201 });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? "Invalid" }, { status: 400 });
  }
}
