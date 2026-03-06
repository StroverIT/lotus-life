import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireAdmin } from "@/lib/apiAuth";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    const users = await prisma.user.findMany({
      include: { membership: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    return NextResponse.json({ ok: false, error: "unknown_error" }, { status: 500 });
  }
}

