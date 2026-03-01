import type { PricingTierId } from "@/lib/pricingStore";
import { prisma } from "@/lib/db";

export interface UserMembership {
  userId: string;
  tierId: PricingTierId;
  validFrom?: string;
  validTo?: string;
}

function rowToMembership(row: { userId: string; tierId: string; validFrom: string | null; validTo: string | null }): UserMembership {
  return {
    userId: row.userId,
    tierId: row.tierId,
    ...(row.validFrom != null && { validFrom: row.validFrom }),
    ...(row.validTo != null && { validTo: row.validTo }),
  };
}

export async function getAllUserMemberships(): Promise<UserMembership[]> {
  const rows = await prisma.userMembership.findMany();
  return rows.map(rowToMembership);
}

export async function getUserMembership(userId: string): Promise<UserMembership | undefined> {
  const row = await prisma.userMembership.findUnique({
    where: { userId },
  });
  return row ? rowToMembership(row) : undefined;
}

export async function setUserMembership(data: {
  userId: string;
  tierId: PricingTierId;
  validFrom?: string;
  validTo?: string;
}): Promise<UserMembership> {
  const row = await prisma.userMembership.upsert({
    where: { userId: data.userId },
    create: {
      userId: data.userId,
      tierId: data.tierId,
      validFrom: data.validFrom ?? null,
      validTo: data.validTo ?? null,
    },
    update: {
      tierId: data.tierId,
      validFrom: data.validFrom ?? null,
      validTo: data.validTo ?? null,
    },
  });
  return rowToMembership(row);
}

export async function removeUserMembership(userId: string): Promise<boolean> {
  const result = await prisma.userMembership.deleteMany({
    where: { userId },
  });
  return result.count > 0;
}
