import type { DaySchedule } from "@/types/schedule";

const DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const defaultBase: DaySchedule[] = [
  { day: "Monday", classes: [{ time: "19:00", name: "Taichi", location: "rodopi" }] },
  {
    day: "Tuesday",
    classes: [
      { time: "18:30", name: "Hatha Yoga", location: "pirin" },
      { time: "18:30", name: "Mobility Flow", location: "rodopi" },
    ],
  },
  { day: "Wednesday", classes: [{ time: "20:30", name: "Dance Meditation", location: "rodopi" }] },
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
  { day: "Sunday", classes: [{ time: "17:30", name: "Art Workshop", location: "rodopi" }] },
];

function buildVariant2(base: DaySchedule[]): DaySchedule[] {
  return base.map((day) => {
    if (day.day === "Monday") {
      return {
        ...day,
        classes: [...day.classes, { time: "20:00", name: "Yin Yoga", location: "pirin" }],
      };
    }
    return { ...day };
  });
}

function buildVariant3(base: DaySchedule[]): DaySchedule[] {
  return base.map((day) => {
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
    return { ...day };
  });
}

function buildVariant4(base: DaySchedule[]): DaySchedule[] {
  return base.map((day) => {
    if (day.day === "Friday") {
      return {
        ...day,
        classes: [
          { time: "9:00", name: "Morning Flow", location: "rodopi" },
          ...day.classes,
        ],
      };
    }
    return { ...day };
  });
}

let baseSchedule: DaySchedule[] = JSON.parse(JSON.stringify(defaultBase));

function buildVariants(): DaySchedule[][] {
  return [
    JSON.parse(JSON.stringify(baseSchedule)),
    buildVariant2(baseSchedule),
    buildVariant3(baseSchedule),
    buildVariant4(baseSchedule),
  ];
}

/** Get schedule variants for week rotation (used by public GET /api/schedules). */
export function getScheduleVariants(): DaySchedule[][] {
  return buildVariants();
}

/** Get current base schedule (for admin GET). */
export function getBaseSchedule(): DaySchedule[] {
  return JSON.parse(JSON.stringify(baseSchedule));
}

/** Update base schedule (admin PUT). Ensures day order. */
export function setBaseSchedule(schedule: DaySchedule[]): DaySchedule[] {
  const byDay = new Map(schedule.map((d) => [d.day, d]));
  baseSchedule = DAYS_ORDER.map((day) => byDay.get(day) ?? { day, classes: [] });
  return getBaseSchedule();
}
