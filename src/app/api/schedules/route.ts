import { NextRequest, NextResponse } from "next/server";
import { addDays, startOfWeek, endOfWeek, format, parseISO } from "date-fns";
import type { WeeklySchedule } from "@/types/schedule";
import { getScheduleVariants } from "@/lib/scheduleStore";

function getWeekStart(d: Date): Date {
  return startOfWeek(d, { weekStartsOn: 1 }); // Monday
}

function getWeekEnd(d: Date): Date {
  return endOfWeek(d, { weekStartsOn: 1 });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month");
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");

    let rangeStart: Date;
    let rangeEnd: Date;

    if (monthParam) {
      const [y, m] = monthParam.split("-").map(Number);
      if (!y || !m) {
        return NextResponse.json(
          { error: "Invalid month format. Use YYYY-MM" },
          { status: 400 }
        );
      }
      rangeStart = new Date(y, m - 1, 1);
      rangeEnd = new Date(y, m, 0);
    } else if (startParam && endParam) {
      rangeStart = parseISO(startParam);
      rangeEnd = parseISO(endParam);
      if (isNaN(rangeStart.getTime()) || isNaN(rangeEnd.getTime())) {
        return NextResponse.json(
          { error: "Invalid start or end date. Use YYYY-MM-DD" },
          { status: 400 }
        );
      }
    } else {
      rangeStart = new Date();
      rangeEnd = addDays(rangeStart, 90); // ~3 months
    }

    const scheduleVariants = getScheduleVariants();
    const weeks: WeeklySchedule[] = [];
    let cursor = getWeekStart(rangeStart);
    let weekIndex = 0;

    while (cursor <= rangeEnd) {
      const weekEnd = getWeekEnd(cursor);
      const schedule =
        scheduleVariants[weekIndex % scheduleVariants.length] ?? scheduleVariants[0];
      const weekLabel = `${format(cursor, "MMMM yyyy")} – Week of ${format(cursor, "MMM d")}`;
      weeks.push({
        id: `week-${format(cursor, "yyyy-MM-dd")}`,
        weekLabel,
        startDate: format(cursor, "yyyy-MM-dd"),
        endDate: format(weekEnd, "yyyy-MM-dd"),
        schedule: JSON.parse(JSON.stringify(schedule)),
      });
      weekIndex += 1;
      cursor = addDays(weekEnd, 1);
    }

    return NextResponse.json(weeks);
  } catch (err) {
    console.error("GET /api/schedules", err);
    return NextResponse.json(
      { error: "Failed to load schedules" },
      { status: 500 }
    );
  }
}
