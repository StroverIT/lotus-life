import { NextRequest, NextResponse } from "next/server";
import type { Event } from "@/types/schedule";

// In-memory events. Replace with Supabase later.
const events: Event[] = [
  {
    id: "ev-1",
    title: "Spring Retreat",
    date: new Date().toISOString().slice(0, 10), // today
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "date query param is required (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const iso = date.slice(0, 10);
    if (iso.length !== 10 || Number.isNaN(Date.parse(iso))) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const forDate = events.filter((e) => e.date === iso);
    return NextResponse.json(forDate);
  } catch (err) {
    console.error("GET /api/events", err);
    return NextResponse.json(
      { error: "Failed to load events" },
      { status: 500 }
    );
  }
}
