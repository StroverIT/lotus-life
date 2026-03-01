import type { PricingTierId, PricingTierData } from "@/lib/pricingStore";

export type { PricingTierId, PricingTierData };

/** Features you gain when upgrading from current tier to target tier. Use when you have tier objects (e.g. from /api/tiers). */
export function getBenefitsFromTo(
  currentTier: PricingTierData | null,
  targetTier: PricingTierData
): string[] {
  if (!currentTier) return targetTier.features;
  return targetTier.features.filter((f) => !currentTier.features.includes(f));
}

/** Features you gain when upgrading to the next tier. tiers must be ordered by sortOrder. Pass null for "no membership". */
export function getBenefitsUpgradeFrom(
  previousTierId: PricingTierId | null,
  tiers: PricingTierData[]
): string[] {
  const idx = previousTierId
    ? tiers.findIndex((t) => t.id === previousTierId) + 1
    : 0;
  const nextTier = tiers[idx];
  if (!nextTier) return [];
  const prevTier = idx > 0 ? tiers[idx - 1] : null;
  if (!prevTier) return nextTier.features;
  return nextTier.features.filter((f) => !prevTier.features.includes(f));
}
