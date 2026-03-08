import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireAdmin } from "@/lib/apiAuth";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    const rows = await prisma.userMembership.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        membership: { select: { id: true, name: true, price: true, period: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    const list = rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: r.user?.name ?? r.guestName ?? null,
      userEmail: r.user?.email ?? r.guestEmail ?? null,
      membershipId: r.membershipId,
      membershipName: r.membership.name,
      membershipPrice: r.membership.price,
      membershipPeriod: r.membership.period,
      status: r.status,
      paymentMethod: r.paymentMethod,
      guestName: r.guestName,
      guestEmail: r.guestEmail,
      guestPhone: r.guestPhone,
      createdAt: r.createdAt.toISOString(),
    }));
    return NextResponse.json(list);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    return NextResponse.json({ ok: false, error: "unknown_error" }, { status: 500 });
  }
}
