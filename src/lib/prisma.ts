import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; prismaAdapter?: PrismaPg };

function getAdapter() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Missing DATABASE_URL");
  return new PrismaPg({ connectionString });
}

export const prisma =
  globalForPrisma.prisma ??
  (() => {
    const adapter = globalForPrisma.prismaAdapter ?? getAdapter();
    const client = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prismaAdapter = adapter;
    }
    return client;
  })();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

