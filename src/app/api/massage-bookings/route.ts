import { NextResponse, type NextRequest } from "next/server";
import { AuthError, getAuthContext } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";
import { addDays, addMonths, endOfDay, format, startOfDay } from "date-fns";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const tomorrow = addDays(startOfDay(new Date()), 1);
    const defaultFrom = tomorrow;
    const defaultTo = endOfDay(addMonths(tomorrow, 3));

    const fromDate = fromParam ? startOfDay(new Date(fromParam + "T12:00:00")) : defaultFrom;
    const toDate = toParam ? endOfDay(new Date(toParam + "T12:00:00")) : defaultTo;

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime()) || fromDate > toDate) {
      return NextResponse.json(
        { ok: false, error: "invalid_date_range" },
        { status: 400 }
      );
    }

    const bookings = await prisma.massageBooking.findMany({
      where: {
        date: { gte: fromDate, lte: toDate },
      },
      select: { date: true, time: true },
    });

    const seen = new Set<string>();
    const taken: Array<{ date: string; time: string }> = [];
    for (const b of bookings) {
      const dateStr = format(new Date(b.date), "yyyy-MM-dd");
      const key = `${dateStr}_${b.time}`;
      if (seen.has(key)) continue;
      seen.add(key);
      taken.push({ date: dateStr, time: b.time });
    }

    return NextResponse.json({ taken });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[GET /api/massage-bookings]", err);
    return NextResponse.json(
      { ok: false, error: process.env.NODE_ENV === "development" ? err.message : "unknown_error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      massageId: string;
      date: string;
      time: string;
      duration: number;
      guestName?: string;
      guestEmail?: string;
      guestPhone?: string;
    };

    const { massageId, date, time, duration } = body;
    if (!massageId || !date || !time || (duration !== 30 && duration !== 60)) {
      return NextResponse.json(
        { ok: false, error: "missing_or_invalid_fields" },
        { status: 400 }
      );
    }

    const slotDate = new Date(date);
    if (Number.isNaN(slotDate.getTime())) {
      return NextResponse.json(
        { ok: false, error: "invalid_date" },
        { status: 400 }
      );
    }

    let userId: string | null = null;
    let guestName: string | null = null;
    let guestEmail: string | null = null;
    let guestPhone: string | null = null;

    try {
      const ctx = await getAuthContext();
      userId = ctx.prismaUser?.id ?? null;
      guestName = ctx.guest ? (ctx.session.user?.name ?? null) : null;
      guestEmail = ctx.guest ? (ctx.session.user?.email ?? null) : null;
    } catch {
      const gName = typeof body.guestName === "string" ? body.guestName.trim() : "";
      const gEmail = typeof body.guestEmail === "string" ? body.guestEmail.trim() : "";
      const gPhone = typeof body.guestPhone === "string" ? body.guestPhone.trim() : "";
      if (!gName || !gEmail || !gPhone) {
        return NextResponse.json(
          { ok: false, error: "guest_name_email_phone_required" },
          { status: 400 }
        );
      }
      guestName = gName;
      guestEmail = gEmail;
      guestPhone = gPhone;
    }

    const booking = await prisma.massageBooking.create({
      data: {
        massageId,
        userId,
        guestName,
        guestEmail,
        guestPhone,
        date: slotDate,
        time,
        duration,
      },
    });

    return NextResponse.json({ ok: true, booking });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[POST /api/massage-bookings]", err);
    return NextResponse.json(
      {
        ok: false,
        error: process.env.NODE_ENV === "development" ? err.message : "unknown_error",
      },
      { status: 500 }
    );
  }
}
