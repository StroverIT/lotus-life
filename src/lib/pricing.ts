import {
  getAllTiers,
  getTierById as getTierByIdStore,
  getUpgradeTiers as getUpgradeTiersStore,
  getBenefitsFromTo as getBenefitsFromToStore,
  type PricingTierId,
  type PricingTierData,
} from "@/lib/pricingStore";

export type { PricingTierId, PricingTierData };

/** Live list from store. Server-side calls get current data; client bundle may have cached snapshot. */
export function getPricingTiers(): PricingTierData[] {
  return getAllTiers();
}

/** Snapshot for client components (e.g. Pricing). Admin tier changes require refresh. */
export const PRICING_TIERS = getAllTiers();

const TIER_ORDER = ["essence", "bloom", "life"] as const;

/** Features you gain when upgrading to the next tier. Pass null for "no membership" (benefits of first tier). */
export function getBenefitsUpgradeFrom(previousTierId: PricingTierId | null): string[] {
  const tiers = getAllTiers();
  const idx = previousTierId ? TIER_ORDER.indexOf(previousTierId as "essence" | "bloom" | "life") + 1 : 0;
  const nextTier = tiers[idx];
  if (!nextTier) return [];
  const prevTier = idx > 0 ? tiers[idx - 1] : null;
  if (!prevTier) return nextTier.features;
  return nextTier.features.filter((f) => !prevTier.features.includes(f));
}

/** Get tier by id. */
export function getTierById(id: PricingTierId): PricingTierData | undefined {
  return getTierByIdStore(id);
}

/** Tiers that are upgrades from current (for "Upgrade" section). */
export function getUpgradeTiers(currentTierId: PricingTierId | null): PricingTierData[] {
  return getUpgradeTiersStore(currentTierId);
}

/** Features you gain when upgrading from current tier to target tier. */
export function getBenefitsFromTo(
  currentTierId: PricingTierId | null,
  targetTierId: PricingTierId
): string[] {
  return getBenefitsFromToStore(currentTierId, targetTierId);
}
