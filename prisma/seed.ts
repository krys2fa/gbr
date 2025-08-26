import "dotenv/config";
/*
  Seed an admin user for Auth.js credentials login.
  Env:
    ADMIN_EMAIL (default: admin@goldbod.local)
    ADMIN_PASSWORD (default: ChangeMe123!)
    ADMIN_ROLE (optional: ADMIN|SUPERADMIN, default: ADMIN)
*/

// Early guard: only attempt DB operations if DATABASE_URL is present.
if (!process.env.DATABASE_URL) {
  console.log("[seed] Skipped: DATABASE_URL not set.");
  process.exit(0);
}

import bcrypt from "bcryptjs";

async function main() {
  const email = (
    process.env.ADMIN_EMAIL || "admin@goldbod.local"
  ).toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const role = (process.env.ADMIN_ROLE || "ADMIN").toUpperCase() as
    | "ADMIN"
    | "SUPERADMIN";

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(
      `[seed] Admin user already exists: ${email} (role: ${existing.role})`
    );
    await prisma.$disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      name: "GoldBod Admin",
      role: role as any,
      passwordHash,
      emailVerified: new Date(),
    } as any,
  });

  console.log(`[seed] Created admin user: ${user.email} (role: ${user.role})`);
  console.log(`[seed] Password: ${password}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("[seed] Error:", e);
  process.exit(1);
});
