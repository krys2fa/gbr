import { prisma } from "@/server/db";

export async function GET() {
  const hasDatabase = !!process.env.DATABASE_URL;
  const nodeEnv = process.env.NODE_ENV || "development";
  const allowInline =
    String(process.env.ALLOW_INLINE_ADMIN_CREATE).toLowerCase() === "true";
  if (!hasDatabase) {
    return Response.json(
      { hasDatabase: false, hasUsers: false, allowInline, nodeEnv },
      { status: 200 }
    );
  }
  try {
    const count = await prisma.user.count();
    return Response.json(
      { hasDatabase: true, hasUsers: count > 0, allowInline, nodeEnv },
      { status: 200 }
    );
  } catch (e: any) {
    return Response.json(
      {
        hasDatabase: false,
        hasUsers: false,
        allowInline,
        nodeEnv,
        error: e?.message,
      },
      { status: 200 }
    );
  }
}
