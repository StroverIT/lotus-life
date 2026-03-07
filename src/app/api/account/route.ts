import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, getAuthContext } from "@/lib/apiAuth";

export const runtime = "nodejs";

type VisitShape = {
  id: string;
  date: string;
  className: string;
  type: "CLASS" | "EVENT";
  duration: string;
  hall: string;
  instructor?: string | null;
};

function toVisitShape(
  row: { id: string; date: Date; className: string; type: "CLASS" | "EVENT"; duration: string; hall: string; instructor?: string | null }
): VisitShape {
  return {
    id: row.id,
    date: row.date.toISOString(),
    className: row.className,
    type: row.type,
    duration: row.duration,
    hall: row.hall,
    instructor: row.instructor ?? null,
  };
}

export async function GET() {
  try {
    const { guest, prismaUser } = await getAuthContext();
    if (guest || !prismaUser) {
      return NextResponse.json({ kind: "guest", membership: null, visits: [] });
    }

    const userId = prismaUser.id;

    const [user, visitRows, scheduleBookings, eventBookings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { membership: true },
      }),
      prisma.visit.findMany({
        where: { userId },
        orderBy: { date: "desc" },
      }),
      prisma.scheduleBooking.findMany({
        where: { userId },
        include: { yogaClass: true },
      }),
      prisma.eventBooking.findMany({
        where: { userId },
        include: { yogaEvent: true },
      }),
    ]);

    const fromVisitTable: VisitShape[] = visitRows.map((v) =>
      toVisitShape({
        id: v.id,
        date: v.date,
        className: v.className,
        type: v.type,
        duration: v.duration,
        hall: v.hall,
        instructor: v.instructor ?? null,
      })
    );

    const fromScheduleBookings: VisitShape[] = scheduleBookings.map((b) =>
      toVisitShape({
        id: `schedule-${b.id}`,
        date: b.createdAt,
        className: b.yogaClass.name,
        type: "CLASS",
        duration: b.yogaClass.duration,
        hall: b.yogaClass.hall,
        instructor: b.yogaClass.instructor ?? null,
      })
    );

    const fromEventBookings: VisitShape[] = eventBookings.map((b) =>
      toVisitShape({
        id: `event-${b.id}`,
        date: b.createdAt,
        className: b.yogaEvent.name,
        type: "EVENT",
        duration: b.yogaEvent.duration,
        hall: b.yogaEvent.hall,
        instructor: null,
      })
    );

    const visits: VisitShape[] = [...fromVisitTable, ...fromScheduleBookings, ...fromEventBookings].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

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

