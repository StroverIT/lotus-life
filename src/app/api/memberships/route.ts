import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireAdmin } from "@/lib/apiAuth";

export const runtime = "nodejs";

export async function GET() {
  const memberships = await prisma.membership.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(memberships);
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = (await request.json()) as {
      id: string;
      name: string;
      price: string;
      period: string;
      features: string[];
      highlighted?: boolean;
      badge?: string | null;
    };

    const created = await prisma.membership.create({
      data: {
        id: body.id,
        name: body.name,
        price: body.price,
        period: body.period,
        features: body.features,
        highlighted: !!body.highlighted,
        badge: body.badge ?? null,
      },
    });

    return NextResponse.json({ ok: true, membership: created });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    return NextResponse.json({ ok: false, error: "unknown_error" }, { status: 500 });
  }
}

