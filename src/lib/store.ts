import type { ScheduleSignUp, EventSignUp } from "@/types/schedule";

// In-memory store for schedule sign-ups. Replace with Supabase later.
const signUps: ScheduleSignUp[] = [];
const eventSignUps: EventSignUp[] = [];

let idCounter = 1;
let eventSignUpIdCounter = 1;

export function addSignUp(
  scheduleSlotId: string,
  data: {
    userId?: string;
    guestEmail?: string;
    guestName?: string;
  }
): ScheduleSignUp {
  const signUp: ScheduleSignUp = {
    id: `su-${idCounter++}`,
    scheduleSlotId,
    ...data,
    signedUpAt: new Date().toISOString(),
  };
  signUps.push(signUp);
  return signUp;
}

export function getSignUpsBySlot(scheduleSlotId: string): ScheduleSignUp[] {
  return signUps.filter((s) => s.scheduleSlotId === scheduleSlotId);
}

export function getAllSignUps(): ScheduleSignUp[] {
  return [...signUps];
}

export function addEventSignUp(
  eventId: string,
  data: {
    userId?: string;
    guestEmail?: string;
    guestName?: string;
  }
): EventSignUp {
  const signUp: EventSignUp = {
    id: `ev-su-${eventSignUpIdCounter++}`,
    eventId,
    ...data,
    signedUpAt: new Date().toISOString(),
  };
  eventSignUps.push(signUp);
  return signUp;
}

export function getEventSignUpsByEvent(eventId: string): EventSignUp[] {
  return eventSignUps.filter((s) => s.eventId === eventId);
}
