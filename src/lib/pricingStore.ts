export type PricingTierId = string;

export interface PricingTierData {
  id: PricingTierId;
  name: string;
  price: number;
  features: string[];
  highlighted?: boolean;
}

const tiers: PricingTierData[] = [
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

const tierOrder: PricingTierId[] = ["essence", "bloom", "life"];

export function getAllTiers(): PricingTierData[] {
  return tiers.map((t) => ({ ...t, features: [...t.features] }));
}

export function getTierById(id: PricingTierId): PricingTierData | undefined {
  return tiers.find((t) => t.id === id);
}

export function getTierOrder(): PricingTierId[] {
  return [...tierOrder];
}

export function addTier(data: Omit<PricingTierData, "id"> & { id?: PricingTierId }): PricingTierData {
  const id = data.id ?? `tier-${Date.now()}`;
  const tier: PricingTierData = { ...data, id, features: data.features ?? [] };
  tiers.push(tier);
  if (!tierOrder.includes(id)) tierOrder.push(id);
  return { ...tier };
}

export function updateTier(
  id: PricingTierId,
  data: Partial<Omit<PricingTierData, "id">>
): PricingTierData | null {
  const idx = tiers.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  tiers[idx] = { ...tiers[idx], ...data };
  return { ...tiers[idx] };
}

export function deleteTier(id: PricingTierId): boolean {
  const idx = tiers.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  tiers.splice(idx, 1);
  const orderIdx = tierOrder.indexOf(id);
  if (orderIdx !== -1) tierOrder.splice(orderIdx, 1);
  return true;
}

export function getUpgradeTiers(currentTierId: PricingTierId | null): PricingTierData[] {
  if (!currentTierId) return getAllTiers();
  const idx = tierOrder.indexOf(currentTierId);
  return tierOrder.slice(idx + 1).map((id) => getTierById(id)!).filter(Boolean);
}

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
