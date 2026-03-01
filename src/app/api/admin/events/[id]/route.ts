import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { getEventById, updateEvent, deleteEvent } from "@/lib/eventsStore";
import type { Event } from "@/types/schedule";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdminSession();
  if (result instanceof NextResponse) return result;
  const { id } = await params;
  const event = getEventById(id);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  return NextResponse.json(event);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdminSession();
  if (result instanceof NextResponse) return result;
  const { id } = await params;
  try {
    const body = await request.json();
    const updated = updateEvent(id, body as Partial<Omit<Event, "id">>);
    if (!updated) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/admin/events/[id]", err);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdminSession();
  if (result instanceof NextResponse) return result;
  const { id } = await params;
  const ok = deleteEvent(id);
  if (!ok) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
