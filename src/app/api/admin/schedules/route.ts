import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { getBaseSchedule, setBaseSchedule } from "@/lib/scheduleStore";
import type { DaySchedule } from "@/types/schedule";

export async function GET() {
  const result = await requireAdminSession();
  if (result instanceof NextResponse) return result;
  const schedule = await getBaseSchedule();
  return NextResponse.json({ schedule });
}

export async function PUT(request: NextRequest) {
  const result = await requireAdminSession();
  if (result instanceof NextResponse) return result;
  try {
    const body = await request.json();
    const { schedule } = body as { schedule: DaySchedule[] };
    if (!Array.isArray(schedule)) {
      return NextResponse.json(
        { error: "schedule must be an array of day schedules" },
        { status: 400 }
      );
    }
    const updated = await setBaseSchedule(schedule);
    return NextResponse.json({ schedule: updated });
  } catch (err) {
    console.error("PUT /api/admin/schedules", err);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}
