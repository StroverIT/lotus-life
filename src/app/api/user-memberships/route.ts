import { NextResponse, type NextRequest } from "next/server";
import { AuthError, getAuthContext, requireUser } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { prismaUser } = await requireUser();
    const userId = prismaUser!.id;

    const applications = await prisma.userMembership.findMany({
      where: { userId },
      include: { membership: { select: { id: true, name: true, price: true, period: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      applications: applications.map((a) => ({
        id: a.id,
        membershipId: a.membershipId,
        membershipName: a.membership.name,
        membershipPrice: a.membership.price,
        membershipPeriod: a.membership.period,
        status: a.status,
        paymentMethod: a.paymentMethod,
        createdAt: a.createdAt,
      })),
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[GET /api/user-memberships]", err);
    return NextResponse.json(
      { ok: false, error: process.env.NODE_ENV === "development" ? err.message : "unknown_error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      membershipId: string;
      guestName?: string;
      guestEmail?: string;
      guestPhone?: string;
    };
    const { membershipId, guestName: gName, guestEmail: gEmail, guestPhone: gPhone } = body;

    if (!membershipId || typeof membershipId !== "string") {
      return NextResponse.json(
        { ok: false, error: "membershipId required" },
        { status: 400 }
      );
    }

    const membership = await prisma.membership.findUnique({
      where: { id: membershipId },
    });
    if (!membership) {
      return NextResponse.json(
        { ok: false, error: "membership_not_found" },
        { status: 404 }
      );
    }

    let userId: string | null = null;
    let guestName: string | null = null;
    let guestEmail: string | null = null;
    let guestPhone: string | null = null;

    try {
      const ctx = await getAuthContext();
      if (ctx.prismaUser) {
        userId = ctx.prismaUser.id;
      } else {
        const name = typeof gName === "string" ? gName.trim() : "";
        const email = typeof gEmail === "string" ? gEmail.trim() : "";
        const phone = typeof gPhone === "string" ? gPhone.trim() : "";
        if (!name || !email || !phone) {
          return NextResponse.json(
            { ok: false, error: "guest_name_email_phone_required" },
            { status: 400 }
          );
        }
        guestName = name;
        guestEmail = email;
        guestPhone = phone;
      }
    } catch {
      const name = typeof gName === "string" ? gName.trim() : "";
      const email = typeof gEmail === "string" ? gEmail.trim() : "";
      const phone = typeof gPhone === "string" ? gPhone.trim() : "";
      if (!name || !email || !phone) {
        return NextResponse.json(
          { ok: false, error: "guest_name_email_phone_required" },
          { status: 400 }
        );
      }
      guestName = name;
      guestEmail = email;
      guestPhone = phone;
    }

    if (userId) {
      const existingPending = await prisma.userMembership.findFirst({
        where: { userId, status: "PENDING" },
        orderBy: { createdAt: "desc" },
      });
      if (existingPending) {
        await prisma.userMembership.update({
          where: { id: existingPending.id },
          data: {
            membershipId,
            guestName: null,
            guestEmail: null,
            guestPhone: null,
          },
        });
        return NextResponse.json({ ok: true });
      }
    }

    await prisma.userMembership.create({
      data: {
        userId,
        membershipId,
        status: "PENDING",
        paymentMethod: "CASH",
        guestName,
        guestEmail,
        guestPhone,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[POST /api/user-memberships]", err);
    return NextResponse.json(
      { ok: false, error: process.env.NODE_ENV === "development" ? err.message : "unknown_error" },
      { status: 500 }
    );
  }
}
