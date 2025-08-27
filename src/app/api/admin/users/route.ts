import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";

const RoleEnum = z.enum([
  "ADMIN",
  "SUPERADMIN",
  "CASHIER",
  "AGENT",
  "TECHNICAL_DIRECTOR",
  "CUSTOMS_OFFICER",
  "EXPORTER",
  "COMPANIES",
]);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1") || 1);
  const pageSize = Math.min(
    Math.max(parseInt(url.searchParams.get("pageSize") || "10") || 10, 5),
    50
  );
  const q = url.searchParams.get("q") || "";
  const role = url.searchParams.get("role") || "";
  const hasDb = !!process.env.DATABASE_URL;
  if (!hasDb) return NextResponse.json({ items: [], total: 0, page, pageSize });
  const where: any = {};
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
    ];
  }
  if (role) where.role = role;
  const [items, total] = await (prisma as any).$transaction([
    (prisma as any).user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    (prisma as any).user.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, pageSize });
}

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
  role: RoleEnum,
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    if (!process.env.DATABASE_URL)
      return NextResponse.json({ ok: false }, { status: 503 });
    const body = await req.json();
    const parsed = CreateUserSchema.parse(body);
    const existing = await (prisma as any).user.findUnique({
      where: { email: parsed.email.toLowerCase() },
      select: { id: true },
    });
    if (existing)
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    const passwordHash = await bcrypt.hash(parsed.password, 12);
    const created = await (prisma as any).user.create({
      data: {
        email: parsed.email.toLowerCase(),
        name: parsed.name || null,
        role: parsed.role as any,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ ok: true, user: created }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Invalid" },
      { status: 400 }
    );
  }
}
