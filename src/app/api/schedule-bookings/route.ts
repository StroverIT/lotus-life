import { NextResponse, type NextRequest } from "next/server";
import { AuthError, getAuthContext, requireUser } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { prismaUser } = await requireUser();
    const userId = prismaUser!.id;

    const bookings = await prisma.scheduleBooking.findMany({
      where: { userId },
      select: { yogaClassId: true },
    });

    return NextResponse.json({
      yogaClassIds: bookings.map((b) => b.yogaClassId),
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[GET /api/schedule-bookings]", err);
    return NextResponse.json(
      { ok: false, error: process.env.NODE_ENV === "development" ? err.message : "unknown_error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      yogaClassId: string;
      guestName?: string;
      guestEmail?: string;
      guestPhone?: string;
    };
    const { yogaClassId, guestName: gName, guestEmail: gEmail, guestPhone: gPhone } = body;

    if (!yogaClassId || typeof yogaClassId !== "string") {
      return NextResponse.json(
        { ok: false, error: "yogaClassId required" },
        { status: 400 }
      );
    }

    const existingClass = await prisma.yogaClass.findUnique({
      where: { id: yogaClassId },
    });
    if (!existingClass) {
      return NextResponse.json(
        { ok: false, error: "class_not_found" },
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
        const alreadyBooked = await prisma.scheduleBooking.findUnique({
          where: { userId_yogaClassId: { userId: ctx.prismaUser.id, yogaClassId } },
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

    await prisma.scheduleBooking.create({
      data: { userId, yogaClassId, guestName, guestEmail, guestPhone },
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
    console.error("[POST /api/schedule-bookings]", err);
    return NextResponse.json(
      { ok: false, error: process.env.NODE_ENV === "development" ? err.message : "unknown_error" },
      { status: 500 }
    );
  }
}
