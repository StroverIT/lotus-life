export const MODAL_IDS = {
  MASSAGE_BOOKING: "massage-booking",
  EVENT_SIGNUP: "event-signup",
} as const;

export type ModalId = (typeof MODAL_IDS)[keyof typeof MODAL_IDS];

/** localStorage key for guest yoga signups (when not logged in). */
export const YOGA_GUEST_SIGNUPS_KEY = "yogaGuestSignups";

export interface YogaGuestSignups {
  yogaClassIds: string[];
  yogaEventIds: string[];
}

export function getYogaGuestSignups(): YogaGuestSignups {
  if (typeof window === "undefined") return { yogaClassIds: [], yogaEventIds: [] };
  try {
    const raw = window.localStorage.getItem(YOGA_GUEST_SIGNUPS_KEY);
    if (!raw) return { yogaClassIds: [], yogaEventIds: [] };
    const data = JSON.parse(raw) as YogaGuestSignups;
    return {
      yogaClassIds: Array.isArray(data.yogaClassIds) ? data.yogaClassIds : [],
      yogaEventIds: Array.isArray(data.yogaEventIds) ? data.yogaEventIds : [],
    };
  } catch {
    return { yogaClassIds: [], yogaEventIds: [] };
  }
}

export function addYogaGuestSignup(
  yogaClassId?: string,
  yogaEventId?: string
): void {
  if (typeof window === "undefined") return;
  const current = getYogaGuestSignups();
  if (yogaClassId && !current.yogaClassIds.includes(yogaClassId)) {
    current.yogaClassIds.push(yogaClassId);
  }
  if (yogaEventId && !current.yogaEventIds.includes(yogaEventId)) {
    current.yogaEventIds.push(yogaEventId);
  }
  window.localStorage.setItem(YOGA_GUEST_SIGNUPS_KEY, JSON.stringify(current));
}
