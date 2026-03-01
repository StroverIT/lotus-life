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

/** Mock attendances for panel. Change length to test 0, 1, or 2+ states. */
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

/** Mock current membership. Set to null for "no membership", or a tier id for "has membership". */
export const MOCK_CURRENT_MEMBERSHIP: PricingTierId | null = null;

/** Presets for demo: 0, 1, or 2+ attendances. */
export function getMockAttendances(preset: "none" | "one" | "many"): MockAttendance[] {
  if (preset === "none") return [];
  if (preset === "one") return MOCK_ATTENDANCES.slice(0, 1);
  return MOCK_ATTENDANCES;
}
