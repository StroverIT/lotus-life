import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireAdmin } from "@/lib/apiAuth";

export const runtime = "nodejs";

export type AdminMassageBookingRow = {
  id: string;
  massageId: string;
  massageName: string;
  userId: string | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  date: string;
  time: string;
  duration: number;
  status: string | null;
  createdAt: string;
};

export async function GET() {
  try {
    await requireAdmin();
    const [bookings, massages] = await Promise.all([
      prisma.massageBooking.findMany({
        orderBy: [{ date: "asc" }, { time: "asc" }],
      }),
      prisma.massage.findMany({ select: { id: true, name: true } }),
    ]);
    const nameById = Object.fromEntries(massages.map((m) => [m.id, m.name]));
    const rows: AdminMassageBookingRow[] = bookings.map((b) => ({
      id: b.id,
      massageId: b.massageId,
      massageName: nameById[b.massageId] ?? "—",
      userId: b.userId,
      guestName: b.guestName,
      guestEmail: b.guestEmail,
      guestPhone: b.guestPhone,
      date: b.date.toISOString().slice(0, 10),
      time: b.time,
      duration: b.duration,
      status: b.status,
      createdAt: b.createdAt.toISOString(),
    }));
    return NextResponse.json(rows);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    return NextResponse.json({ ok: false, error: "unknown_error" }, { status: 500 });
  }
}
