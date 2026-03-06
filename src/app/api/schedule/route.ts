import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireAdmin } from "@/lib/apiAuth";

export const runtime = "nodejs";

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export async function GET() {
  const days = await prisma.daySchedule.findMany({
    include: { classes: true },
  });

  const sorted = days
    .slice()
    .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));

  return NextResponse.json(
    sorted.map((d) => ({
      day: d.day,
      classes: d.classes.sort((a, b) => a.time.localeCompare(b.time)),
    })),
  );
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = (await request.json()) as {
      day: string;
      cls: {
        id: string;
        name: string;
        time: string;
        duration: string;
        hall: string;
        instructor: string;
        description: string;
      };
    };

    const daySchedule = await prisma.daySchedule.upsert({
      where: { day: body.day },
      update: {},
      create: { day: body.day },
    });

    const created = await prisma.yogaClass.create({
      data: {
        ...body.cls,
        dayScheduleId: daySchedule.id,
      },
    });

    return NextResponse.json({ ok: true, class: created });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    return NextResponse.json({ ok: false, error: "unknown_error" }, { status: 500 });
  }
}

