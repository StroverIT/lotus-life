import { NextRequest, NextResponse } from "next/server";
import { addSignUp, getSignUpsBySlot } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      scheduleSlotId,
      userId,
      guestEmail,
      guestName,
    }: {
      scheduleSlotId?: string;
      userId?: string;
      guestEmail?: string;
      guestName?: string;
    } = body;

    if (!scheduleSlotId || typeof scheduleSlotId !== "string") {
      return NextResponse.json(
        { error: "scheduleSlotId is required" },
        { status: 400 }
      );
    }

    if (!userId && !guestEmail) {
      return NextResponse.json(
        { error: "Either userId or guestEmail is required" },
        { status: 400 }
      );
    }

    const signUp = addSignUp(scheduleSlotId, {
      userId,
      guestEmail,
      guestName,
    });

    return NextResponse.json(signUp, { status: 201 });
  } catch (err) {
    console.error("POST /api/schedules/sign-up", err);
    return NextResponse.json(
      { error: "Failed to sign up" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scheduleSlotId = searchParams.get("scheduleSlotId");

    if (!scheduleSlotId) {
      return NextResponse.json(
        { error: "scheduleSlotId query param is required" },
        { status: 400 }
      );
    }

    const signUps = getSignUpsBySlot(scheduleSlotId);
    return NextResponse.json(signUps);
  } catch (err) {
    console.error("GET /api/schedules/sign-up", err);
    return NextResponse.json(
      { error: "Failed to load sign-ups" },
      { status: 500 }
    );
  }
}
