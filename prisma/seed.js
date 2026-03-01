import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString?.trim()) {
  console.error("DATABASE_URL is not set in .env. For local Supabase use:");
  console.error("  DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54342/postgres");
  console.error("(Port 54342 matches this project's supabase/config.toml. Run: supabase start)");
  process.exit(1);
}

const adapter = new PrismaPg({
  connectionString,
  connectionTimeoutMillis: 10000,
});
const prisma = new PrismaClient({ adapter });

const defaultSchedule = [
  { day: "Monday", classes: [{ time: "19:00", name: "Taichi", location: "rodopi" }] },
  {
    day: "Tuesday",
    classes: [
      { time: "18:30", name: "Hatha Yoga", location: "pirin" },
      { time: "18:30", name: "Mobility Flow", location: "rodopi" },
    ],
  },
  { day: "Wednesday", classes: [{ time: "20:30", name: "Dance Meditation", location: "rodopi" }] },
  {
    day: "Thursday",
    classes: [
      { time: "9:30", name: "Qi-gong", location: "rodopi" },
      { time: "19:00", name: "Taichi", location: "rodopi" },
      { time: "18:30", name: "Aerial Yoga", location: "pirin" },
    ],
  },
  {
    day: "Friday",
    classes: [
      { time: "19:00", name: "Lotus Face Yoga", location: "rodopi" },
      { time: "20:30", name: "Lotus Sound Journey", location: "rodopi" },
    ],
  },
  {
    day: "Saturday",
    classes: [
      { time: "11:30", name: "Hatha Yoga", location: "pirin" },
      { time: "17:00", name: "Aerial Yoga", location: "pirin" },
      { time: "18:30", name: "Mobility Flow", location: "rodopi" },
    ],
  },
  { day: "Sunday", classes: [{ time: "17:30", name: "Art Workshop", location: "rodopi" }] },
];

const today = new Date().toISOString().slice(0, 10);
const in7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const in14 = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const in21 = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const defaultEvents = [
  { title: "Spring Retreat", date: today, time: "10:00", location: "Rodopi Hall", description: "A day of mindfulness and renewal." },
  { title: "Sound Bath Evening", date: today, time: "19:00", location: "Pirin Hall", description: "Deep relaxation with crystal bowls." },
  { title: "Art & Meditation Workshop", date: in7, time: "14:00", location: "Rodopi Hall", description: "Combine creative expression with meditation." },
  { title: "Full Moon Ceremony", date: in14, time: "20:00", location: "Rodopi Hall", description: "Guided ceremony under the full moon." },
  { title: "Open House", date: in21, time: "11:00", location: "Both Halls", description: null },
];

const defaultTiers = [
  { id: "essence", name: "Lotus Essence", price: 50, features: ["1 friend pass", "Up to 6 visits", "Each additional visit: €8"], highlighted: false, sortOrder: 0 },
  { id: "bloom", name: "Lotus Bloom", price: 75, features: ["1 friend pass", "Unlimited regular practices", "15% off massages (Aksiniya Tsenova)", "15% off events", "15% off items in Lotus Life"], highlighted: true, sortOrder: 1 },
  { id: "life", name: "Lotus Life", price: 120, features: ["2 friend passes", "Unlimited regular practices", "15% off massages (Aksiniya Tsenova)", "15% off events", "15% off individual sessions", "15% off items in Lotus Life", "Welcome gift box"], highlighted: false, sortOrder: 2 },
];

async function main() {
  await prisma.scheduleBase.upsert({
    where: { id: "default" },
    create: { id: "default", schedule: defaultSchedule },
    update: { schedule: defaultSchedule },
  });

  const existingEvents = await prisma.event.count();
  if (existingEvents === 0) {
    await prisma.event.createMany({ data: defaultEvents });
  }

  for (const tier of defaultTiers) {
    await prisma.pricingTier.upsert({
      where: { id: tier.id },
      create: { ...tier, features: tier.features },
      update: { name: tier.name, price: tier.price, features: tier.features, highlighted: tier.highlighted, sortOrder: tier.sortOrder },
    });
  }

  console.log("Seed completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect().catch(() => {});
    if (e.message?.includes("Connection terminated") || e.message?.includes("ECONNREFUSED")) {
      console.error("\nTip: Ensure Supabase is running (supabase start) and DATABASE_URL in .env uses port 54342.");
      console.error("Then run: npm run db:push  (to create tables) before npm run db:seed");
    }
    process.exit(1);
  });
