import { NextRequest, NextResponse } from "next/server";
import {
  addDays,
  startOfWeek,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
} from "date-fns";
import type { DaySchedule, WeeklySchedule } from "@/types/schedule";

// Base schedule (matches current Schedule.tsx). Variants for different weeks.
const baseSchedule: DaySchedule[] = [
  {
    day: "Monday",
    classes: [{ time: "19:00", name: "Taichi", location: "rodopi" }],
  },
  {
    day: "Tuesday",
    classes: [
      { time: "18:30", name: "Hatha Yoga", location: "pirin" },
      { time: "18:30", name: "Mobility Flow", location: "rodopi" },
    ],
  },
  {
    day: "Wednesday",
    classes: [{ time: "20:30", name: "Dance Meditation", location: "rodopi" }],
  },
  {
    day: "Thursday",
    classes: [
      { time: "9:30", name: "Qi-gong", location: "rodopi" },
      { time: "19:00", name: "Taichi", location: "rodopi" },
      { time: "18:30", name: "Aerial Yoga", location: "pirin" },
    ],
  },
  {
    day: "Friday",
    classes: [
      { time: "19:00", name: "Lotus Face Yoga", location: "rodopi" },
      { time: "20:30", name: "Lotus Sound Journey", location: "rodopi" },
    ],
  },
  {
    day: "Saturday",
    classes: [
      { time: "11:30", name: "Hatha Yoga", location: "pirin" },
      { time: "17:00", name: "Aerial Yoga", location: "pirin" },
      { time: "18:30", name: "Mobility Flow", location: "rodopi" },
    ],
  },
  {
    day: "Sunday",
    classes: [{ time: "17:30", name: "Art Workshop", location: "rodopi" }],
  },
];

// Week 2 variant: extra evening class on Monday
const variant2: DaySchedule[] = baseSchedule.map((day) => {
  if (day.day === "Monday") {
    return {
      ...day,
      classes: [
        ...day.classes,
        { time: "20:00", name: "Yin Yoga", location: "pirin" },
      ],
    };
  }
  return day;
});

// Week 3 variant: Saturday has different times
const variant3: DaySchedule[] = baseSchedule.map((day) => {
  if (day.day === "Saturday") {
    return {
      ...day,
      classes: [
        { time: "10:00", name: "Hatha Yoga", location: "pirin" },
        { time: "16:00", name: "Aerial Yoga", location: "pirin" },
        { time: "18:00", name: "Mobility Flow", location: "rodopi" },
      ],
    };
  }
  return day;
});

// Week 4 variant: Friday adds morning class
const variant4: DaySchedule[] = baseSchedule.map((day) => {
  if (day.day === "Friday") {
    return {
      ...day,
      classes: [
        { time: "9:00", name: "Morning Flow", location: "rodopi" },
        ...day.classes,
      ],
    };
  }
  return day;
});

const scheduleVariants = [baseSchedule, variant2, variant3, variant4];

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

    const weeks: WeeklySchedule[] = [];
    let cursor = getWeekStart(rangeStart);
    let weekIndex = 0;

    while (cursor <= rangeEnd) {
      const weekEnd = getWeekEnd(cursor);
      const schedule =
        scheduleVariants[weekIndex % scheduleVariants.length] ?? baseSchedule;
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
