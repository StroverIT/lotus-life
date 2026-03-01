import type { PricingTierId } from "@/lib/pricing";

export type AttendanceType = "class" | "event";

export interface MockAttendance {
  id: string;
  type: AttendanceType;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  attendedAt: string; // ISO for ordering
}

/** Mock attendances for panel. Base set for "one" and building "many". */
export const MOCK_ATTENDANCES: MockAttendance[] = [
  {
    id: "att-1",
    type: "class",
    title: "Hatha Yoga",
    date: "2026-03-10",
    time: "18:30",
    location: "Pirin Hall",
    attendedAt: "2026-03-10T18:30:00Z",
  },
  {
    id: "att-2",
    type: "event",
    title: "Spring Retreat",
    date: "2026-03-15",
    time: "10:00",
    location: "Rodopi Hall",
    attendedAt: "2026-03-15T10:00:00Z",
  },
];

/** Page size for infinite scroll in visits tab. */
export const VISITS_PAGE_SIZE = 5;

const CLASS_TITLES = [
  "Hatha Yoga",
  "Taichi",
  "Mobility Flow",
  "Dance Meditation",
  "Qi-gong",
  "Aerial Yoga",
  "Lotus Face Yoga",
  "Lotus Sound Journey",
  "Yin Yoga",
  "Morning Flow",
];
const EVENT_TITLES = [
  "Spring Retreat",
  "Sound Bath Evening",
  "Art & Meditation Workshop",
  "Full Moon Ceremony",
  "Open House",
];
const LOCATIONS = ["Pirin Hall", "Rodopi Hall"];

/** Generate 20+ mock attendances for "many" preset (infinite scroll demo). */
function generateManyAttendances(): MockAttendance[] {
  const list: MockAttendance[] = [];
  let id = 1;
  for (let i = 0; i < 22; i++) {
    const isEvent = i % 3 === 0;
    const titles = isEvent ? EVENT_TITLES : CLASS_TITLES;
    const title = titles[i % titles.length];
    const day = 1 + (i % 28);
    const month = 2 + Math.floor(i / 28) % 10;
    const date = `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const hours = isEvent ? [10, 14, 19][i % 3] : [9, 11, 18, 19, 20][i % 5];
    const mins = [0, 30][i % 2];
    const time = `${String(hours).padStart(2, "0")}:${mins === 0 ? "00" : "30"}`;
    const location = LOCATIONS[i % LOCATIONS.length];
    list.push({
      id: `att-${id++}`,
      type: isEvent ? "event" : "class",
      title,
      date,
      time,
      location,
      attendedAt: `${date}T${time}:00Z`,
    });
  }
  return list.sort(
    (a, b) => new Date(b.attendedAt).getTime() - new Date(a.attendedAt).getTime()
  );
}

const MANY_ATTENDANCES = generateManyAttendances();

/** Mock current membership. Set to null for "no membership", or a tier id for "has membership". */
export const MOCK_CURRENT_MEMBERSHIP: PricingTierId | null = null;

/** Presets for demo: 0, 1, or 2+ attendances. "many" returns 22 items for infinite scroll. */
export function getMockAttendances(preset: "none" | "one" | "many"): MockAttendance[] {
  if (preset === "none") return [];
  if (preset === "one") return MOCK_ATTENDANCES.slice(0, 1);
  return MANY_ATTENDANCES;
}
