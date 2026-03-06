import "dotenv/config";
import { PrismaClient, type AuthType, type UserRole, type VisitType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Missing DATABASE_URL");
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

type SeedDaySchedule = {
  day: string;
  classes: Array<{
    id: string;
    name: string;
    time: string;
    duration: string;
    hall: string;
    instructor: string;
    description: string;
  }>;
};

type SeedYogaEvent = {
  id: string;
  name: string;
  dateLabel: string;
  time: string;
  duration: string;
  hall: string;
  price: string;
  description: string;
};

type SeedMassage = {
  id: string;
  name: string;
  iconKey: string;
  price30: string;
  price60: string;
  description: string;
  benefits: string[];
  availableDays: string[];
};

type SeedMembership = {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  badge?: string | null;
};

type SeedUser = {
  id: string;
  name: string;
  email: string | null;
  phone?: string | null;
  membershipId: string | null;
  joinedAt?: string | null;
  totalVisits?: number;
  lastVisit?: string | null;
  role: UserRole;
  authType: AuthType;
};

type SeedVisit = {
  id: string;
  userId?: string | null;
  date: string;
  className: string;
  type: VisitType;
  duration: string;
  hall: string;
  instructor?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedDir = path.join(__dirname, "seed-data");

async function loadJson<T>(filename: string): Promise<T> {
  const raw = await readFile(path.join(seedDir, filename), "utf8");
  return JSON.parse(raw) as T;
}

function parseDate(date: string | null | undefined): Date | null {
  if (!date) return null;
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function main() {
  const memberships = await loadJson<SeedMembership[]>("memberships.json");
  const massages = await loadJson<SeedMassage[]>("massages.json");
  const weeklySchedule = await loadJson<SeedDaySchedule[]>("weeklySchedule.json");
  const yogaEvents = await loadJson<SeedYogaEvent[]>("yogaEvents.json");
  const users = await loadJson<SeedUser[]>("users.json");
  const visits = await loadJson<SeedVisit[]>("visits.json");

  await prisma.membership.createMany({
    data: memberships.map((m) => ({
      id: m.id,
      name: m.name,
      price: m.price,
      period: m.period,
      features: m.features,
      highlighted: !!m.highlighted,
      badge: m.badge ?? null,
    })),
    skipDuplicates: true,
  });

  for (const m of massages) {
    await prisma.massage.upsert({
      where: { id: m.id },
      update: {
        name: m.name,
        iconKey: m.iconKey,
        price30: m.price30,
        price60: m.price60,
        description: m.description,
        benefits: m.benefits,
        availableDays: m.availableDays,
      },
      create: {
        id: m.id,
        name: m.name,
        iconKey: m.iconKey,
        price30: m.price30,
        price60: m.price60,
        description: m.description,
        benefits: m.benefits,
        availableDays: m.availableDays,
      },
    });
  }

  // Day schedules + classes
  for (const day of weeklySchedule) {
    const dayRow = await prisma.daySchedule.upsert({
      where: { day: day.day },
      update: {},
      create: { day: day.day },
    });

    if (day.classes.length > 0) {
      await prisma.yogaClass.createMany({
        data: day.classes.map((c) => ({
          id: c.id,
          name: c.name,
          time: c.time,
          duration: c.duration,
          hall: c.hall,
          instructor: c.instructor,
          description: c.description,
          dayScheduleId: dayRow.id,
        })),
        skipDuplicates: true,
      });
    }
  }

  await prisma.yogaEvent.createMany({
    data: yogaEvents.map((e) => ({
      id: e.id,
      name: e.name,
      dateLabel: e.dateLabel,
      time: e.time,
      duration: e.duration,
      hall: e.hall,
      price: e.price,
      description: e.description,
    })),
    skipDuplicates: true,
  });

  await prisma.user.createMany({
    data: users.map((u) => ({
      id: u.id,
      supabaseAuthId: null,
      email: u.email,
      name: u.name,
      phone: u.phone ?? null,
      role: u.role,
      authType: u.authType,
      membershipId: u.membershipId,
      joinedAt: parseDate(u.joinedAt ?? null),
      totalVisits: u.totalVisits ?? 0,
      lastVisit: parseDate(u.lastVisit ?? null),
    })),
    skipDuplicates: true,
  });

  await prisma.visit.createMany({
    data: visits.map((v) => ({
      id: v.id,
      userId: v.userId ?? null,
      date: new Date(v.date),
      className: v.className,
      type: v.type,
      duration: v.duration,
      hall: v.hall,
      instructor: v.instructor ?? null,
      guestName: v.guestName ?? null,
      guestEmail: v.guestEmail ?? null,
      guestPhone: v.guestPhone ?? null,
    })),
    skipDuplicates: true,
  });

  const settingsCount = await prisma.siteSettings.count();
  if (settingsCount === 0) {
    await prisma.siteSettings.create({ data: { defaultSeason: "summer" } });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

