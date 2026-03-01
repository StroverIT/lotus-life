import type { PricingTierId } from "@/lib/pricingStore";

export interface UserMembership {
  userId: string;
  tierId: PricingTierId;
  validFrom?: string; // YYYY-MM-DD
  validTo?: string; // YYYY-MM-DD
}

const assignments: UserMembership[] = [];

export function getAllUserMemberships(): UserMembership[] {
  return assignments.map((a) => ({ ...a }));
}

export function getUserMembership(userId: string): UserMembership | undefined {
  return assignments.find((a) => a.userId === userId) ?? undefined;
}

export function setUserMembership(data: {
  userId: string;
  tierId: PricingTierId;
  validFrom?: string;
  validTo?: string;
}): UserMembership {
  const existing = assignments.findIndex((a) => a.userId === data.userId);
  const entry: UserMembership = {
    userId: data.userId,
    tierId: data.tierId,
    validFrom: data.validFrom,
    validTo: data.validTo,
  };
  if (existing >= 0) {
    assignments[existing] = entry;
  } else {
    assignments.push(entry);
  }
  return { ...entry };
}

export function removeUserMembership(userId: string): boolean {
  const idx = assignments.findIndex((a) => a.userId === userId);
  if (idx === -1) return false;
  assignments.splice(idx, 1);
  return true;
}
