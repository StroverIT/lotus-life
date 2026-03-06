import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireAdmin } from "@/lib/apiAuth";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = (await request.json()) as Partial<{
      name: string;
      iconKey: string;
      price30: string;
      price60: string;
      description: string;
      benefits: string[];
      availableDays: string[];
    }>;

    const updated = await prisma.massage.update({
      where: { id: params.id },
      data: {
        ...body,
        ...(body.benefits ? { benefits: body.benefits } : {}),
        ...(body.availableDays ? { availableDays: body.availableDays } : {}),
      },
    });

    return NextResponse.json({ ok: true, massage: updated });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    return NextResponse.json({ ok: false, error: "unknown_error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await prisma.massage.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    return NextResponse.json({ ok: false, error: "unknown_error" }, { status: 500 });
  }
}

