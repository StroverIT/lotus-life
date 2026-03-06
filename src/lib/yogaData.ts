import { prisma } from "@/lib/prisma";
import type { DaySchedule, YogaEvent } from "@/types/catalog";

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export async function getSchedule(): Promise<DaySchedule[]> {
  const days = await prisma.daySchedule.findMany({
    include: { classes: true },
  });
  const sorted = days
    .slice()
    .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));
  return sorted.map((d) => ({
    day: d.day,
    classes: d.classes.sort((a, b) => a.time.localeCompare(b.time)),
  }));
}

export async function getEvents(): Promise<YogaEvent[]> {
  return prisma.yogaEvent.findMany({ orderBy: { createdAt: "asc" } });
}
