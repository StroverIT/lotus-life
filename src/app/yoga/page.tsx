import { getSchedule, getEvents } from "@/lib/yogaData";
import Yoga from "@/pages/Yoga";

export default async function YogaPage() {
  const [schedule, events] = await Promise.all([getSchedule(), getEvents()]);
  return <Yoga initialSchedule={schedule} initialEvents={events} />;
}
