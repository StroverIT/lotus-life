export const MODAL_IDS = {
  MASSAGE_BOOKING: "massage-booking",
  EVENT_SIGNUP: "event-signup",
} as const;

export type ModalId = (typeof MODAL_IDS)[keyof typeof MODAL_IDS];
