import { prisma } from "@/lib/db";

export type PricingTierId = string;

export interface PricingTierData {
  id: PricingTierId;
  name: string;
  price: number;
  features: string[];
  highlighted?: boolean;
  sortOrder?: number;
}

function rowToTier(row: { id: string; name: string; price: number; features: unknown; highlighted: boolean; sortOrder: number }): PricingTierData {
  const features = Array.isArray(row.features) ? (row.features as string[]) : [];
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    features,
    highlighted: row.highlighted,
    sortOrder: row.sortOrder,
  };
}

export async function getAllTiers(): Promise<PricingTierData[]> {
  const rows = await prisma.pricingTier.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(rowToTier);
}

export async function getTierById(id: PricingTierId): Promise<PricingTierData | undefined> {
  const row = await prisma.pricingTier.findUnique({ where: { id } });
  return row ? rowToTier(row) : undefined;
}

export async function addTier(data: Omit<PricingTierData, "id"> & { id?: PricingTierId }): Promise<PricingTierData> {
  const max = await prisma.pricingTier.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (max._max.sortOrder ?? -1) + 1;
  const id = data.id ?? `tier-${Date.now()}`;
  const row = await prisma.pricingTier.create({
    data: {
      id,
      name: data.name,
      price: data.price,
      features: (data.features ?? []) as unknown as object,
      highlighted: data.highlighted ?? false,
      sortOrder,
    },
  });
  return rowToTier(row);
}

export async function updateTier(
  id: PricingTierId,
  data: Partial<Omit<PricingTierData, "id">>
): Promise<PricingTierData | null> {
  try {
    const row = await prisma.pricingTier.update({
      where: { id },
      data: {
        ...(data.name != null && { name: data.name }),
        ...(data.price != null && { price: data.price }),
        ...(data.features != null && { features: data.features as unknown as object }),
        ...(data.highlighted !== undefined && { highlighted: data.highlighted }),
        ...(data.sortOrder != null && { sortOrder: data.sortOrder }),
      },
    });
    return rowToTier(row);
  } catch {
    return null;
  }
}

export async function deleteTier(id: PricingTierId): Promise<boolean> {
  const result = await prisma.pricingTier.deleteMany({ where: { id } });
  return result.count > 0;
}

export async function getUpgradeTiers(currentTierId: PricingTierId | null): Promise<PricingTierData[]> {
  const tiers = await getAllTiers();
  if (!currentTierId) return tiers;
  const idx = tiers.findIndex((t) => t.id === currentTierId);
  return tiers.slice(idx + 1);
}

export async function getBenefitsFromTo(
  currentTierId: PricingTierId | null,
  targetTierId: PricingTierId
): Promise<string[]> {
  const target = await getTierById(targetTierId);
  if (!target) return [];
  const current = currentTierId ? await getTierById(currentTierId) : null;
  if (!current) return target.features;
  return target.features.filter((f) => !current!.features.includes(f));
}
