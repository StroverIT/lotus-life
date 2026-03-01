import type { Event } from "@/types/schedule";
import { prisma } from "@/lib/db";

function rowToEvent(row: { id: string; title: string; date: string; time: string; location: string; description: string | null }): Event {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time,
    location: row.location,
    ...(row.description != null && { description: row.description }),
  };
}

export async function getAllEvents(): Promise<Event[]> {
  const rows = await prisma.event.findMany();
  return rows.map(rowToEvent);
}

export async function getEventsByDate(date: string): Promise<Event[]> {
  const rows = await prisma.event.findMany({
    where: { date: date.slice(0, 10) },
  });
  return rows.map(rowToEvent);
}

export async function getEventById(id: string): Promise<Event | undefined> {
  const row = await prisma.event.findUnique({ where: { id } });
  return row ? rowToEvent(row) : undefined;
}

export async function addEvent(data: Omit<Event, "id">): Promise<Event> {
  const row = await prisma.event.create({
    data: {
      title: data.title,
      date: data.date.slice(0, 10),
      time: data.time,
      location: data.location,
      description: data.description ?? null,
    },
  });
  return rowToEvent(row);
}

export async function updateEvent(id: string, data: Partial<Omit<Event, "id">>): Promise<Event | null> {
  try {
    const row = await prisma.event.update({
      where: { id },
      data: {
        ...(data.title != null && { title: data.title }),
        ...(data.date != null && { date: data.date.slice(0, 10) }),
        ...(data.time != null && { time: data.time }),
        ...(data.location != null && { location: data.location }),
        ...(data.description !== undefined && { description: data.description ?? null }),
      },
    });
    return rowToEvent(row);
  } catch {
    return null;
  }
}

export async function deleteEvent(id: string): Promise<boolean> {
  const result = await prisma.event.deleteMany({ where: { id } });
  return result.count > 0;
}
