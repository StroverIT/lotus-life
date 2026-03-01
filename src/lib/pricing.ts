export type PricingTierId = "essence" | "bloom" | "life";

export interface PricingTierData {
  id: PricingTierId;
  name: string;
  price: number;
  features: string[];
  highlighted?: boolean;
}

export const PRICING_TIERS: PricingTierData[] = [
  {
    id: "essence",
    name: "Lotus Essence",
    price: 50,
    features: [
      "1 friend pass",
      "Up to 6 visits",
      "Each additional visit: €8",
    ],
  },
  {
    id: "bloom",
    name: "Lotus Bloom",
    price: 75,
    features: [
      "1 friend pass",
      "Unlimited regular practices",
      "15% off massages (Aksiniya Tsenova)",
      "15% off events",
      "15% off items in Lotus Life",
    ],
    highlighted: true,
  },
  {
    id: "life",
    name: "Lotus Life",
    price: 120,
    features: [
      "2 friend passes",
      "Unlimited regular practices",
      "15% off massages (Aksiniya Tsenova)",
      "15% off events",
      "15% off individual sessions",
      "15% off items in Lotus Life",
      "Welcome gift box",
    ],
  },
];

const TIER_ORDER: PricingTierId[] = ["essence", "bloom", "life"];

/** Features you gain when upgrading to the next tier. Pass null for "no membership" (benefits of first tier). */
export function getBenefitsUpgradeFrom(previousTierId: PricingTierId | null): string[] {
  const idx = previousTierId ? TIER_ORDER.indexOf(previousTierId) + 1 : 0;
  const nextTier = PRICING_TIERS[idx];
  if (!nextTier) return [];
  const prevTier = idx > 0 ? PRICING_TIERS[idx - 1] : null;
  if (!prevTier) return nextTier.features;
  return nextTier.features.filter((f) => !prevTier.features.includes(f));
}

/** Get tier by id. */
export function getTierById(id: PricingTierId): PricingTierData | undefined {
  return PRICING_TIERS.find((t) => t.id === id);
}

/** Tiers that are upgrades from current (for "Upgrade" section). */
export function getUpgradeTiers(currentTierId: PricingTierId | null): PricingTierData[] {
  if (!currentTierId) return PRICING_TIERS;
  const idx = TIER_ORDER.indexOf(currentTierId);
  return PRICING_TIERS.slice(idx + 1);
}

/** Features you gain when upgrading from current tier to target tier. */
export function getBenefitsFromTo(
  currentTierId: PricingTierId | null,
  targetTierId: PricingTierId
): string[] {
  const target = getTierById(targetTierId);
  if (!target) return [];
  const current = currentTierId ? getTierById(currentTierId) : null;
  if (!current) return target.features;
  return target.features.filter((f) => !current!.features.includes(f));
}
