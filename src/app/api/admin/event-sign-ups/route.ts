import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const result = await requireAdminSession();
  if (result instanceof NextResponse) return result;
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    const signUps = await prisma.eventSignUp.findMany({
      where: eventId ? { eventId } : undefined,
      orderBy: { signedUpAt: "desc" },
    });

    return NextResponse.json(
      signUps.map((s) => ({
        id: s.id,
        eventId: s.eventId,
        userId: s.userId ?? undefined,
        guestEmail: s.guestEmail ?? undefined,
        guestName: s.guestName ?? undefined,
        signedUpAt: s.signedUpAt.toISOString(),
      }))
    );
  } catch (err) {
    console.error("GET /api/admin/event-sign-ups", err);
    return NextResponse.json(
      { error: "Failed to load event sign-ups" },
      { status: 500 }
    );
  }
}
