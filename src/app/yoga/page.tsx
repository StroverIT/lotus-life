import { getSchedule, getEvents } from "@/lib/yogaData";
import Yoga from "@/pages/Yoga";

export const dynamic = "force-dynamic";

export default async function YogaPage() {
  const [schedule, events] = await Promise.all([getSchedule(), getEvents()]);
  return <Yoga initialSchedule={schedule} initialEvents={events} />;
}
