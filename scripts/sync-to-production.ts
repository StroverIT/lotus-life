/**
 * Sync all Supabase data (Postgres + Storage) from current env (source) to production (target).
 *
 * Source: .env (DATABASE_URL, DIRECT_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
 * Target: .env.production (same var names)
 *
 * Usage:
 *   npm run sync:prod
 *   # or:
 *   npx tsx scripts/sync-to-production.ts
 *   # or with explicit target:
 *   TARGET_DATABASE_URL=... TARGET_SUPABASE_URL=... npx tsx scripts/sync-to-production.ts
 *
 * Ensure .env has source (dev) and .env.production has target (prod). The script will:
 * 1. Copy all Prisma-managed tables from source DB to target DB (replacing target data).
 * 2. Copy all files in the "blog" storage bucket from source to target (if Supabase keys are set).
 */

import "dotenv/config";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";

const BLOG_BUCKET = "blog";

// ----- Load env -----
function loadProductionEnv(): Record<string, string> {
  const path = resolve(process.cwd(), ".env.production");
  if (!existsSync(path)) {
    throw new Error(
      ".env.production not found. Create it with DATABASE_URL, DIRECT_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY for production."
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
const sourceDirectUrl = process.env.DIRECT_URL;
const sourceSupabaseUrl = process.env.SUPABASE_URL;
const sourceSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const targetDatabaseUrl = process.env.TARGET_DATABASE_URL ?? prodEnv.DATABASE_URL;
const targetDirectUrl = process.env.TARGET_DIRECT_URL ?? prodEnv.DIRECT_URL;
const targetSupabaseUrl = process.env.TARGET_SUPABASE_URL ?? prodEnv.SUPABASE_URL;
const targetSupabaseKey =
  process.env.TARGET_SUPABASE_SERVICE_ROLE_KEY ?? prodEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!sourceDatabaseUrl || !targetDatabaseUrl) {
  console.error(
    "Missing DATABASE_URL (source) or target (TARGET_DATABASE_URL / .env.production)."
  );
  process.exit(1);
}

const prismaSource = new PrismaClient({
  adapter: new PrismaPg({ connectionString: sourceDatabaseUrl }),
});

const prismaTarget = new PrismaClient({
  adapter: new PrismaPg({ connectionString: targetDatabaseUrl }),
});

const P2021_TABLE_DOES_NOT_EXIST = "P2021";

function isTableMissingError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e != null &&
    (e as { code?: string }).code === P2021_TABLE_DOES_NOT_EXIST
  );
}

async function runOnTarget<T>(
  tableName: string,
  fn: () => Promise<T>
): Promise<{ ok: true; value: T } | { ok: false; tableMissing: true }> {
  try {
    const value = await fn();
    return { ok: true, value };
  } catch (e) {
    if (isTableMissingError(e)) {
      console.warn(
        `  [skip] Table "${tableName}" does not exist on target. Run: npm run db:migrate:prod (or create the table in production), then re-run sync.`
      );
      return { ok: false, tableMissing: true };
    }
    throw e;
  }
}

async function syncDatabase() {
  console.log("Syncing database tables (source → production)...\n");

  const skipTables = new Set<string>();

  // Delete order: respect FK (children first)
  const deleteSteps = [
    { name: "Account", fn: () => prismaTarget.account.deleteMany() },
    { name: "Session", fn: () => prismaTarget.session.deleteMany() },
    { name: "MassageBooking", fn: () => prismaTarget.massageBooking.deleteMany() },
    { name: "ScheduleBooking", fn: () => prismaTarget.scheduleBooking.deleteMany() },
    { name: "EventBooking", fn: () => prismaTarget.eventBooking.deleteMany() },
    { name: "User", fn: () => prismaTarget.user.deleteMany() },
    { name: "VerificationToken", fn: () => prismaTarget.verificationToken.deleteMany() },
    { name: "Membership", fn: () => prismaTarget.membership.deleteMany() },
    { name: "YogaClass", fn: () => prismaTarget.yogaClass.deleteMany() },
    { name: "DaySchedule", fn: () => prismaTarget.daySchedule.deleteMany() },
    { name: "YogaEvent", fn: () => prismaTarget.yogaEvent.deleteMany() },
    { name: "Massage", fn: () => prismaTarget.massage.deleteMany() },
    { name: "SiteSettings", fn: () => prismaTarget.siteSettings.deleteMany() },
  ];

  for (const { name, fn } of deleteSteps) {
    const result = await runOnTarget(name, fn);
    if (!result.ok && result.tableMissing) skipTables.add(name);
  }

  // Insert order: parents first, then dependents
  const memberships = await prismaSource.membership.findMany();
  if (memberships.length && !skipTables.has("Membership")) {
    const r = await runOnTarget("Membership", () =>
      prismaTarget.membership.createMany({ data: memberships })
    );
    if (r.ok) console.log("  Membership:", memberships.length);
  }

  const users = await prismaSource.user.findMany();
  if (users.length && !skipTables.has("User")) {
    const r = await runOnTarget("User", () =>
      prismaTarget.user.createMany({
        data: users.map((u) => ({
          id: u.id,
          supabaseAuthId: u.supabaseAuthId,
          email: u.email,
          emailVerified: u.emailVerified,
          name: u.name,
          image: u.image,
          phone: u.phone,
          role: u.role,
          authType: u.authType,
          passwordHash: u.passwordHash,
          membershipId: u.membershipId,
          joinedAt: u.joinedAt,
          totalVisits: u.totalVisits,
          lastVisit: u.lastVisit,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        })),
      })
    );
    if (r.ok) console.log("  User:", users.length);
  }

  const daySchedules = await prismaSource.daySchedule.findMany();
  if (daySchedules.length && !skipTables.has("DaySchedule")) {
    const r = await runOnTarget("DaySchedule", () =>
      prismaTarget.daySchedule.createMany({ data: daySchedules })
    );
    if (r.ok) console.log("  DaySchedule:", daySchedules.length);
  }

  const yogaClasses = await prismaSource.yogaClass.findMany();
  if (yogaClasses.length && !skipTables.has("YogaClass")) {
    const r = await runOnTarget("YogaClass", () =>
      prismaTarget.yogaClass.createMany({
        data: yogaClasses.map((c) => ({
          id: c.id,
          name: c.name,
          time: c.time,
          duration: c.duration,
          hall: c.hall,
          instructor: c.instructor,
          description: c.description,
          dayScheduleId: c.dayScheduleId,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
      })
    );
    if (r.ok) console.log("  YogaClass:", yogaClasses.length);
  }

  const yogaEvents = await prismaSource.yogaEvent.findMany();
  if (yogaEvents.length && !skipTables.has("YogaEvent")) {
    const r = await runOnTarget("YogaEvent", () =>
      prismaTarget.yogaEvent.createMany({ data: yogaEvents })
    );
    if (r.ok) console.log("  YogaEvent:", yogaEvents.length);
  }

  const massages = await prismaSource.massage.findMany();
  if (massages.length && !skipTables.has("Massage")) {
    const r = await runOnTarget("Massage", () =>
      prismaTarget.massage.createMany({ data: massages })
    );
    if (r.ok) console.log("  Massage:", massages.length);
  }

  const siteSettings = await prismaSource.siteSettings.findMany();
  if (siteSettings.length && !skipTables.has("SiteSettings")) {
    const r = await runOnTarget("SiteSettings", () =>
      prismaTarget.siteSettings.createMany({ data: siteSettings })
    );
    if (r.ok) console.log("  SiteSettings:", siteSettings.length);
  }

  const verificationTokens = await prismaSource.verificationToken.findMany();
  if (verificationTokens.length && !skipTables.has("VerificationToken")) {
    const r = await runOnTarget("VerificationToken", () =>
      prismaTarget.verificationToken.createMany({ data: verificationTokens })
    );
    if (r.ok) console.log("  VerificationToken:", verificationTokens.length);
  }

  const accounts = await prismaSource.account.findMany();
  if (accounts.length && !skipTables.has("Account")) {
    const r = await runOnTarget("Account", () =>
      prismaTarget.account.createMany({ data: accounts })
    );
    if (r.ok) console.log("  Account:", accounts.length);
  }

  const sessions = await prismaSource.session.findMany();
  if (sessions.length && !skipTables.has("Session")) {
    const r = await runOnTarget("Session", () =>
      prismaTarget.session.createMany({ data: sessions })
    );
    if (r.ok) console.log("  Session:", sessions.length);
  }

  const massageBookings = await prismaSource.massageBooking.findMany();
  if (massageBookings.length && !skipTables.has("MassageBooking")) {
    const r = await runOnTarget("MassageBooking", () =>
      prismaTarget.massageBooking.createMany({ data: massageBookings })
    );
    if (r.ok) console.log("  MassageBooking:", massageBookings.length);
  }

  const scheduleBookings = await prismaSource.scheduleBooking.findMany();
  if (scheduleBookings.length && !skipTables.has("ScheduleBooking")) {
    const r = await runOnTarget("ScheduleBooking", () =>
      prismaTarget.scheduleBooking.createMany({ data: scheduleBookings })
    );
    if (r.ok) console.log("  ScheduleBooking:", scheduleBookings.length);
  }

  const eventBookings = await prismaSource.eventBooking.findMany();
  if (eventBookings.length && !skipTables.has("EventBooking")) {
    const r = await runOnTarget("EventBooking", () =>
      prismaTarget.eventBooking.createMany({ data: eventBookings })
    );
    if (r.ok) console.log("  EventBooking:", eventBookings.length);
  }

  if (skipTables.size) {
    console.log(
      "\n  Some tables were skipped (missing on target). After running db:migrate:prod, re-run this script to sync them.\n"
    );
  }
  console.log("Database sync done.\n");
}

async function syncStorage() {
  if (
    !sourceSupabaseUrl ||
    !sourceSupabaseKey ||
    !targetSupabaseUrl ||
    !targetSupabaseKey
  ) {
    console.log(
      "Skipping storage sync: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for source or target.\n"
    );
    return;
  }

  const supabaseSource = createClient(sourceSupabaseUrl, sourceSupabaseKey, {
    auth: { persistSession: false },
  });
  const supabaseTarget = createClient(targetSupabaseUrl, targetSupabaseKey, {
    auth: { persistSession: false },
  });

  const { data: existingBucket, error: getError } =
    await supabaseTarget.storage.getBucket(BLOG_BUCKET);
  if (getError || !existingBucket) {
    const { error: createErr } = await supabaseTarget.storage.createBucket(
      BLOG_BUCKET,
      { public: true }
    );
    if (createErr) {
      console.warn(
        "  Could not create target bucket:",
        createErr.message,
        "- uploads will be skipped.\n"
      );
      return;
    }
    console.log("  Created target bucket:", BLOG_BUCKET);
  }

  console.log("Syncing storage bucket:", BLOG_BUCKET, "\n");

  async function listAllPaths(prefix: string): Promise<string[]> {
    const { data: items, error } = await supabaseSource.storage
      .from(BLOG_BUCKET)
      .list(prefix || "", { limit: 1000 });
    if (error) return [];
    const paths: string[] = [];
    for (const item of items ?? []) {
      if (!item.name) continue;
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (
        item.id != null ||
        (item.metadata && Object.keys(item.metadata).length > 0)
      ) {
        paths.push(fullPath);
      } else {
        const nested = await listAllPaths(fullPath);
        paths.push(...nested);
      }
    }
    return paths;
  }

  const allPaths = await listAllPaths("");
  if (allPaths.length === 0) {
    console.log("  No files in source bucket.\n");
    return;
  }

  let copied = 0;
  for (const path of allPaths) {
    const { data: blob, error: downError } = await supabaseSource.storage
      .from(BLOG_BUCKET)
      .download(path);
    if (downError || !blob) {
      console.warn("  Skip", path, downError?.message ?? "no blob");
      continue;
    }
    const buffer = Buffer.from(await blob.arrayBuffer());
    const { error: upError } = await supabaseTarget.storage
      .from(BLOG_BUCKET)
      .upload(path, buffer, {
        contentType: blob.type || "application/octet-stream",
        upsert: true,
      });
    if (upError) {
      console.warn("  Upload failed", path, upError.message);
      continue;
    }
    copied++;
    console.log("  ", path);
  }

  console.log("\nStorage sync done. Files copied:", copied, "\n");
}

async function main() {
  console.log(
    "=== Sync to production (source = current .env, target = .env.production) ===\n"
  );

  try {
    await syncDatabase();
    await syncStorage();
    console.log("All done.");
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prismaSource.$disconnect();
    await prismaTarget.$disconnect();
  }
}

main();
