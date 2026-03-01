export type Location = "pirin" | "rodopi";

export interface ClassItem {
  time: string;
  name: string;
  location: Location;
}

export interface DaySchedule {
  day: string;
  classes: ClassItem[];
}

export interface WeeklySchedule {
  id: string;
  weekLabel: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  schedule: DaySchedule[];
}

export interface ScheduleSignUp {
  id: string;
  scheduleSlotId: string;
  userId?: string;
  guestEmail?: string;
  guestName?: string;
  signedUpAt: string; // ISO
}

export interface Event {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  description?: string;
}

export interface EventSignUp {
  id: string;
  eventId: string;
  userId?: string;
  guestEmail?: string;
  guestName?: string;
  signedUpAt: string; // ISO
}
