import { prisma } from "@/server/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL)
    return Response.json({ error: "Database not configured" }, { status: 400 });
  if (String(process.env.ALLOW_INLINE_ADMIN_CREATE).toLowerCase() !== "true") {
    return Response.json(
      { error: "Inline admin creation disabled" },
      { status: 403 }
    );
  }
  const count = await prisma.user.count();
  if (count > 0)
    return Response.json({ error: "Users already exist" }, { status: 400 });

  const { email, password, role } = await req.json();
  if (!email || !password)
    return Response.json(
      { error: "Email and password required" },
      { status: 400 }
    );
  const hash = await bcrypt.hash(password, 12);
  const created = await prisma.user.create({
    data: {
      email: String(email).toLowerCase(),
      passwordHash: hash,
      role: (role || "ADMIN") as any,
      name: "Administrator",
      emailVerified: new Date(),
    },
  });
  return Response.json(
    { ok: true, id: created.id, email: created.email, role: created.role },
    { status: 201 }
  );
}
