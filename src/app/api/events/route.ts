import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireAdmin } from "@/lib/apiAuth";

export const runtime = "nodejs";

export async function GET() {
  const events = await prisma.yogaEvent.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = (await request.json()) as {
      id: string;
      name: string;
      dateLabel: string;
      time: string;
      duration: string;
      hall: string;
      price: string;
      description: string;
    };
    const created = await prisma.yogaEvent.create({ data: body });
    return NextResponse.json({ ok: true, event: created });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    return NextResponse.json({ ok: false, error: "unknown_error" }, { status: 500 });
  }
}

