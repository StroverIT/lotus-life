import { NextResponse, type NextRequest } from "next/server";
import { AuthError, getAuthContext, requireUser } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { prismaUser } = await requireUser();
    const userId = prismaUser!.id;

    const bookings = await prisma.eventBooking.findMany({
      where: { userId },
      select: { yogaEventId: true },
    });

    return NextResponse.json({
      yogaEventIds: bookings.map((b) => b.yogaEventId),
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[GET /api/event-bookings]", err);
    return NextResponse.json(
      { ok: false, error: process.env.NODE_ENV === "development" ? err.message : "unknown_error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      yogaEventId: string;
      guestName?: string;
      guestEmail?: string;
      guestPhone?: string;
    };
    const { yogaEventId, guestName: gName, guestEmail: gEmail, guestPhone: gPhone } = body;

    if (!yogaEventId || typeof yogaEventId !== "string") {
      return NextResponse.json(
        { ok: false, error: "yogaEventId required" },
        { status: 400 }
      );
    }

    const existingEvent = await prisma.yogaEvent.findUnique({
      where: { id: yogaEventId },
    });
    if (!existingEvent) {
      return NextResponse.json(
        { ok: false, error: "event_not_found" },
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
        const alreadyBooked = await prisma.eventBooking.findUnique({
          where: { userId_yogaEventId: { userId: ctx.prismaUser.id, yogaEventId } },
        });
        if (alreadyBooked) {
          return NextResponse.json({ ok: false, error: "already_booked" }, { status: 409 });
        }
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

    await prisma.eventBooking.create({
      data: { userId, yogaEventId, guestName, guestEmail, guestPhone },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    const prismaError = e as { code?: string };
    if (prismaError.code === "P2002") {
      return NextResponse.json(
        { ok: false, error: "already_booked" },
        { status: 409 }
      );
    }
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[POST /api/event-bookings]", err);
    return NextResponse.json(
      { ok: false, error: process.env.NODE_ENV === "development" ? err.message : "unknown_error" },
      { status: 500 }
    );
  }
}
