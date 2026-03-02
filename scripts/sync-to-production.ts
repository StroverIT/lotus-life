/**
 * Sync all Prisma-managed tables from the dev database (.env) to the
 * production database (.env.production).
 *
 * Source: .env (DATABASE_URL)
 * Target: .env.production (DATABASE_URL)
 *
 * Usage:
 *   npx tsx scripts/sync-to-production.ts
 *   # or with explicit target:
 *   TARGET_DATABASE_URL=... npx tsx scripts/sync-to-production.ts
 *
 * Ensure:
 * - .env has the source (dev) DATABASE_URL
 * - .env.production has the target (prod) DATABASE_URL
 *
 * The script will:
 * 1. Delete all rows from the target tables in a safe FK order.
 * 2. Copy all rows from the same tables in the source DB to the target DB.
 */

import "dotenv/config";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// ----- Load env from .env.production -----
function loadProductionEnv(): Record<string, string> {
  const path = resolve(process.cwd(), ".env.production");
  if (!existsSync(path)) {
    throw new Error(
      ".env.production not found. Create it with DATABASE_URL (and DIRECT_URL if you use it) for production.",
    );
  }

  const raw = readFileSync(path, "utf-8");
  const out: Record<string, string> = {};

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    const unquoted = value.replace(/^["']|["']$/g, "");
    out[key] = unquoted;
  }

  return out;
}

const prodEnv = loadProductionEnv();

const sourceDatabaseUrl = process.env.DATABASE_URL;
const targetDatabaseUrl = process.env.TARGET_DATABASE_URL ?? prodEnv.DATABASE_URL;

if (!sourceDatabaseUrl || !targetDatabaseUrl) {
  console.error(
    "Missing DATABASE_URL for source (.env) or target (TARGET_DATABASE_URL / .env.production).",
  );
  process.exit(1);
}

// Use explicit URLs for source/target so we can point them at different databases.
const sourceAdapter = new PrismaPg({ connectionString: sourceDatabaseUrl });
const prismaSource = new PrismaClient({
  adapter: sourceAdapter,
});

const targetAdapter = new PrismaPg({ connectionString: targetDatabaseUrl });
const prismaTarget = new PrismaClient({
  adapter: targetAdapter,
});

const P2021_TABLE_DOES_NOT_EXIST = "P2021";

function isTableMissingError(e: unknown): boolean {
  return typeof e === "object" && e != null && (e as { code?: string }).code === P2021_TABLE_DOES_NOT_EXIST;
}

async function runOnTarget<T>(
  tableName: string,
  fn: () => Promise<T>,
): Promise<{ ok: true; value: T } | { ok: false; tableMissing: true }> {
  try {
    const value = await fn();
    return { ok: true, value };
  } catch (e) {
    if (isTableMissingError(e)) {
      console.warn(
        `  [skip] Table "${tableName}" does not exist on target. Run: npm run db:push:prod or npm run db:migrate:prod, then re-run sync.`,
      );
      return { ok: false, tableMissing: true };
    }
    throw e;
  }
}

async function syncDatabase() {
  console.log("Syncing database tables (source → production)...\n");

  // Delete order respects FK relations:
  // - UserMembership depends on PricingTier (and indirectly on User by convention)
  // - EventSignUp depends on Event
  const skipTables = new Set<string>();

  const deleteSteps = [
    { name: "UserMembership", fn: () => prismaTarget.userMembership.deleteMany() },
    { name: "PricingTier", fn: () => prismaTarget.pricingTier.deleteMany() },
    { name: "EventSignUp", fn: () => prismaTarget.eventSignUp.deleteMany() },
    { name: "Event", fn: () => prismaTarget.event.deleteMany() },
    { name: "ScheduleSignUp", fn: () => prismaTarget.scheduleSignUp.deleteMany() },
    { name: "ScheduleBase", fn: () => prismaTarget.scheduleBase.deleteMany() },
    { name: "User", fn: () => prismaTarget.user.deleteMany() },
  ];

  for (const { name, fn } of deleteSteps) {
    const result = await runOnTarget(name, fn);
    if (!result.ok && result.tableMissing) {
      skipTables.add(name);
    }
  }

  // Insert order: base tables first, dependents after.
  const users = await prismaSource.user.findMany();
  if (users.length && !skipTables.has("User")) {
    const r = await runOnTarget("User", () => prismaTarget.user.createMany({ data: users }));
    if (r.ok) console.log("  User:", users.length);
  }

  const scheduleBases = await prismaSource.scheduleBase.findMany();
  if (scheduleBases.length && !skipTables.has("ScheduleBase")) {
    const r = await runOnTarget("ScheduleBase", () =>
      prismaTarget.scheduleBase.createMany({ data: scheduleBases }),
    );
    if (r.ok) console.log("  ScheduleBase:", scheduleBases.length);
  }

  const events = await prismaSource.event.findMany();
  if (events.length && !skipTables.has("Event")) {
    const r = await runOnTarget("Event", () => prismaTarget.event.createMany({ data: events }));
    if (r.ok) console.log("  Event:", events.length);
  }

  const eventSignUps = await prismaSource.eventSignUp.findMany();
  if (eventSignUps.length && !skipTables.has("EventSignUp")) {
    const r = await runOnTarget("EventSignUp", () =>
      prismaTarget.eventSignUp.createMany({ data: eventSignUps }),
    );
    if (r.ok) console.log("  EventSignUp:", eventSignUps.length);
  }

  const scheduleSignUps = await prismaSource.scheduleSignUp.findMany();
  if (scheduleSignUps.length && !skipTables.has("ScheduleSignUp")) {
    const r = await runOnTarget("ScheduleSignUp", () =>
      prismaTarget.scheduleSignUp.createMany({ data: scheduleSignUps }),
    );
    if (r.ok) console.log("  ScheduleSignUp:", scheduleSignUps.length);
  }

  const pricingTiers = await prismaSource.pricingTier.findMany();
  if (pricingTiers.length && !skipTables.has("PricingTier")) {
    const r = await runOnTarget("PricingTier", () =>
      prismaTarget.pricingTier.createMany({ data: pricingTiers }),
    );
    if (r.ok) console.log("  PricingTier:", pricingTiers.length);
  }

  const userMemberships = await prismaSource.userMembership.findMany();
  if (userMemberships.length && !skipTables.has("UserMembership")) {
    const r = await runOnTarget("UserMembership", () =>
      prismaTarget.userMembership.createMany({ data: userMemberships }),
    );
    if (r.ok) console.log("  UserMembership:", userMemberships.length);
  }

  if (skipTables.size) {
    console.log(
      "\n  Some tables were skipped (missing on target). After running db:push:prod or db:migrate:prod, re-run this script to sync them.\n",
    );
  }

  console.log("Database sync done.\n");
}

async function main() {
  console.log("=== Sync to production (source = .env, target = .env.production) ===\n");

  try {
    await syncDatabase();
    console.log("All done.");
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prismaSource.$disconnect();
    await prismaTarget.$disconnect();
  }
}

void main();

