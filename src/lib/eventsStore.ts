import type { Event } from "@/types/schedule";

const events: Event[] = [
  {
    id: "ev-1",
    title: "Spring Retreat",
    date: new Date().toISOString().slice(0, 10),
    time: "10:00",
    location: "Rodopi Hall",
    description: "A day of mindfulness and renewal.",
  },
  {
    id: "ev-2",
    title: "Sound Bath Evening",
    date: new Date().toISOString().slice(0, 10),
    time: "19:00",
    location: "Pirin Hall",
    description: "Deep relaxation with crystal bowls.",
  },
  {
    id: "ev-3",
    title: "Art & Meditation Workshop",
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().slice(0, 10);
    })(),
    time: "14:00",
    location: "Rodopi Hall",
    description: "Combine creative expression with meditation.",
  },
  {
    id: "ev-4",
    title: "Full Moon Ceremony",
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      return d.toISOString().slice(0, 10);
    })(),
    time: "20:00",
    location: "Rodopi Hall",
    description: "Guided ceremony under the full moon.",
  },
  {
    id: "ev-5",
    title: "Open House",
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 21);
      return d.toISOString().slice(0, 10);
    })(),
    time: "11:00",
    location: "Both Halls",
  },
];

let idCounter = 6;

export function getAllEvents(): Event[] {
  return events.map((e) => ({ ...e }));
}

export function getEventsByDate(date: string): Event[] {
  return events.filter((e) => e.date === date.slice(0, 10));
}

export function getEventById(id: string): Event | undefined {
  return events.find((e) => e.id === id);
}

export function addEvent(data: Omit<Event, "id">): Event {
  const id = `ev-${idCounter++}`;
  const event: Event = { ...data, id };
  events.push(event);
  return event;
}

export function updateEvent(id: string, data: Partial<Omit<Event, "id">>): Event | null {
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  events[idx] = { ...events[idx], ...data };
  return events[idx];
}

export function deleteEvent(id: string): boolean {
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  events.splice(idx, 1);
  return true;
}
