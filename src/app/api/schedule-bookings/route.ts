import { NextResponse, type NextRequest } from "next/server";
import { AuthError, requireUser } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { prismaUser } = await requireUser();
    const userId = prismaUser!.id;

    const bookings = await prisma.scheduleBooking.findMany({
      where: { userId },
      select: { yogaClassId: true },
    });

    return NextResponse.json({
      yogaClassIds: bookings.map((b) => b.yogaClassId),
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[GET /api/schedule-bookings]", err);
    return NextResponse.json(
      { ok: false, error: process.env.NODE_ENV === "development" ? err.message : "unknown_error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prismaUser } = await requireUser();
    const userId = prismaUser!.id;

    const body = (await request.json()) as { yogaClassId: string };
    const { yogaClassId } = body;

    if (!yogaClassId || typeof yogaClassId !== "string") {
      return NextResponse.json(
        { ok: false, error: "yogaClassId required" },
        { status: 400 }
      );
    }

    const existing = await prisma.yogaClass.findUnique({
      where: { id: yogaClassId },
    });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "class_not_found" },
        { status: 404 }
      );
    }

    await prisma.scheduleBooking.create({
      data: { userId, yogaClassId },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    const prismaError = e as { code?: string };
    if (prismaError.code === "P2002") {
      return NextResponse.json(
        { ok: false, error: "already_booked" },
        { status: 409 }
      );
    }
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[POST /api/schedule-bookings]", err);
    return NextResponse.json(
      { ok: false, error: process.env.NODE_ENV === "development" ? err.message : "unknown_error" },
      { status: 500 }
    );
  }
}
