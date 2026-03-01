import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const result = await requireAdminSession();
  if (result instanceof NextResponse) return result;
  try {
    const { searchParams } = new URL(request.url);
    const scheduleSlotId = searchParams.get("scheduleSlotId");

    const signUps = await prisma.scheduleSignUp.findMany({
      where: scheduleSlotId ? { scheduleSlotId } : undefined,
      orderBy: { signedUpAt: "desc" },
    });

    return NextResponse.json(
      signUps.map((s) => ({
        id: s.id,
        scheduleSlotId: s.scheduleSlotId,
        userId: s.userId ?? undefined,
        guestEmail: s.guestEmail ?? undefined,
        guestName: s.guestName ?? undefined,
        signedUpAt: s.signedUpAt.toISOString(),
      }))
    );
  } catch (err) {
    console.error("GET /api/admin/schedule-sign-ups", err);
    return NextResponse.json(
      { error: "Failed to load schedule sign-ups" },
      { status: 500 }
    );
  }
}
