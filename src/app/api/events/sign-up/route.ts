import { NextRequest, NextResponse } from "next/server";
import { addEventSignUp, getEventSignUpsByEvent } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      eventId,
      userId,
      guestEmail,
      guestName,
    }: {
      eventId?: string;
      userId?: string;
      guestEmail?: string;
      guestName?: string;
    } = body;

    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json(
        { error: "eventId is required" },
        { status: 400 }
      );
    }

    if (!userId && !guestEmail) {
      return NextResponse.json(
        { error: "Either userId or guestEmail is required" },
        { status: 400 }
      );
    }

    const signUp = addEventSignUp(eventId, {
      userId,
      guestEmail,
      guestName,
    });

    return NextResponse.json(signUp, { status: 201 });
  } catch (err) {
    console.error("POST /api/events/sign-up", err);
    return NextResponse.json(
      { error: "Failed to sign up" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId query param is required" },
        { status: 400 }
      );
    }

    const signUps = getEventSignUpsByEvent(eventId);
    return NextResponse.json(signUps);
  } catch (err) {
    console.error("GET /api/events/sign-up", err);
    return NextResponse.json(
      { error: "Failed to load sign-ups" },
      { status: 500 }
    );
  }
}
