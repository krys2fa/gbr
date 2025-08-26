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
  } else {
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
    console.log(
      `[seed] Created admin user: ${user.email} (role: ${user.role})`
    );
    console.log(`[seed] Password: ${password}`);
  }

  // Seed ValueType rows (idempotent)
  const valueTypes = ["Exporter", "GOLDBOD"];
  for (const name of valueTypes) {
    await prisma.valueType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`[seed] Ensured ValueType rows: ${valueTypes.join(", ")}`);

  // Create a sample Case with an item
  const demoRef = "GB-DEMO-001";
  const demoUser = await prisma.user.upsert({
    where: { email: "exporter@example.com" },
    update: {},
    create: { email: "exporter@example.com", role: "COMPANIES" as any },
  });
  const kase = await prisma.case.upsert({
    where: { ref: demoRef },
    update: {},
    create: {
      ref: demoRef,
      applicantId: demoUser.id,
      status: "SUBMITTED" as any,
      items: {
        create: [
          {
            karat: 22,
            weightGrams: 1000,
            impurities: 1.2,
            valuation: 100000 as any,
          },
        ],
      },
    },
  });
  console.log(`[seed] Ensured Case: ${kase.ref}`);

  // Sample Payment
  await prisma.payment.upsert({
    where: { reference: "PAY-DEMO-001" },
    update: {},
    create: {
      caseId: kase.id,
      amount: 5000 as any,
      currency: "USD",
      method: "cash",
      reference: "PAY-DEMO-001",
      status: "completed",
    },
  });
  console.log(`[seed] Ensured Payment: PAY-DEMO-001`);

  // Sample Export
  const expo = await prisma.export.upsert({
    where: { caseId: kase.id },
    update: { documentNo: "EXP-DEMO-001", destination: "Dubai" },
    create: {
      caseId: kase.id,
      documentNo: "EXP-DEMO-001",
      destination: "Dubai",
    },
  });
  console.log(`[seed] Ensured Export: ${expo.documentNo}`);

  // Sample Assay Certificate (if model present)
  try {
    await (prisma as any).assayCertificate.upsert({
      where: { certificateNo: "CERT-DEMO-001" },
      update: {},
      create: {
        lots: 1,
        grossWeightGrams: 1000 as any,
        finenessPercent: 96.5 as any,
        netWeightGrams: 965 as any,
        netWeightOz: 31.028 as any,
        certificateNo: "CERT-DEMO-001",
        date: new Date(),
        client: "Exporter Ltd",
        reference: "REF-123",
        exporter: "Exporter Ltd",
        exportId: expo.id,
      },
    });
    console.log(`[seed] Ensured Assay Certificate: CERT-DEMO-001`);
  } catch {}
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("[seed] Error:", e);
  process.exit(1);
});
