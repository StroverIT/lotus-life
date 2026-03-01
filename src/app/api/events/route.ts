import { NextRequest, NextResponse } from "next/server";
import { getEventsByDate } from "@/lib/eventsStore";

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

    const forDate = await getEventsByDate(iso);
    return NextResponse.json(forDate);
  } catch (err) {
    console.error("GET /api/events", err);
    return NextResponse.json(
      { error: "Failed to load events" },
      { status: 500 }
    );
  }
}
