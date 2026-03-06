import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, getAuthContext } from "@/lib/apiAuth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { guest, prismaUser } = await getAuthContext();
    if (guest || !prismaUser) {
      return NextResponse.json({ kind: "guest", membership: null, visits: [] });
    }

    const [user, visits] = await Promise.all([
      prisma.user.findUnique({
        where: { id: prismaUser.id },
        include: { membership: true },
      }),
      prisma.visit.findMany({
        where: { userId: prismaUser.id },
        orderBy: { date: "desc" },
      }),
    ]);

    return NextResponse.json({
      kind: "user",
      user,
      membership: user?.membership ?? null,
      visits,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    return NextResponse.json({ ok: false, error: "unknown_error" }, { status: 500 });
  }
}

