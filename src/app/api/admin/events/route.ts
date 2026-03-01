import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { getAllEvents, addEvent } from "@/lib/eventsStore";
import type { Event } from "@/types/schedule";

export async function GET(request: NextRequest) {
  const result = await requireAdminSession();
  if (result instanceof NextResponse) return result;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const events = date
    ? getAllEvents().filter((e) => e.date === date.slice(0, 10))
    : getAllEvents();
  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  const result = await requireAdminSession();
  if (result instanceof NextResponse) return result;
  try {
    const body = await request.json();
    const { title, date, time, location, description } = body as Partial<Event>;
    if (!title || !date || !time || !location) {
      return NextResponse.json(
        { error: "title, date, time, and location are required" },
        { status: 400 }
      );
    }
    const event = addEvent({
      title,
      date: date.slice(0, 10),
      time,
      location,
      description,
    });
    return NextResponse.json(event);
  } catch (err) {
    console.error("POST /api/admin/events", err);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
