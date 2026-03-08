import { getSchedule, getEvents } from "@/lib/yogaData";
import Yoga from "@/pages/Yoga";

export const revalidate = 120; // 2 minutes — allow caching of RSC payload and server data

export default async function YogaPage() {
  const [schedule, events] = await Promise.all([getSchedule(), getEvents()]);
  return <Yoga initialSchedule={schedule} initialEvents={events} />;
}
