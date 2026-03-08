import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireAdmin } from "@/lib/apiAuth";

export const runtime = "nodejs";

type AdminVisitRow = {
  id: string;
  userId: string | null;
  date: string;
  className: string;
  type: "CLASS" | "EVENT";
  duration: string;
  hall: string;
  instructor?: string | null;
};

export async function GET() {
  try {
    await requireAdmin();
    const [scheduleBookings, eventBookings] = await Promise.all([
      prisma.scheduleBooking.findMany({
        include: { yogaClass: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.eventBooking.findMany({
        include: { yogaEvent: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const fromSchedule: AdminVisitRow[] = scheduleBookings.map((b) => ({
      id: `schedule-${b.id}`,
      userId: b.userId,
      date: b.createdAt.toISOString(),
      className: b.yogaClass.name,
      type: "CLASS",
      duration: b.yogaClass.duration,
      hall: b.yogaClass.hall,
      instructor: b.yogaClass.instructor ?? null,
    }));

    const fromEvents: AdminVisitRow[] = eventBookings.map((b) => ({
      id: `event-${b.id}`,
      userId: b.userId,
      date: b.createdAt.toISOString(),
      className: b.yogaEvent.name,
      type: "EVENT",
      duration: b.yogaEvent.duration,
      hall: b.yogaEvent.hall,
      instructor: null,
    }));

    const visits: AdminVisitRow[] = [...fromSchedule, ...fromEvents].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return NextResponse.json(visits);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    return NextResponse.json({ ok: false, error: "unknown_error" }, { status: 500 });
  }
}
