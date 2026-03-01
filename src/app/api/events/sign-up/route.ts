import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

    const signUp = await prisma.eventSignUp.create({
      data: {
        eventId,
        userId: userId ?? null,
        guestEmail: guestEmail ?? null,
        guestName: guestName ?? null,
      },
    });

    return NextResponse.json(
      {
        id: signUp.id,
        eventId: signUp.eventId,
        userId: signUp.userId ?? undefined,
        guestEmail: signUp.guestEmail ?? undefined,
        guestName: signUp.guestName ?? undefined,
        signedUpAt: signUp.signedUpAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/events/sign-up", err);
    return NextResponse.json(
      { error: "Failed to sign up" },
      { status: 500 }
    );
  }
}
