import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireAdmin } from "@/lib/apiAuth";

export const runtime = "nodejs";

export async function GET() {
  const massages = await prisma.massage.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(massages);
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = (await request.json()) as {
      id: string;
      name: string;
      iconKey: string;
      price30: string;
      price60: string;
      description: string;
      benefits: string[];
      availableDays: string[];
    };

    const created = await prisma.massage.create({
      data: {
        ...body,
        benefits: body.benefits,
        availableDays: body.availableDays,
      },
    });

    return NextResponse.json({ ok: true, massage: created });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    return NextResponse.json({ ok: false, error: "unknown_error" }, { status: 500 });
  }
}

