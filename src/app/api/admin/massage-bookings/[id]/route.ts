import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireAdmin } from "@/lib/apiAuth";

export const runtime = "nodejs";

const VALID_STATUS = ["shown", "didnt_show"] as const;

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = (await _request.json()) as { status?: string };
    const status = typeof body.status === "string" ? body.status.toLowerCase().trim() : null;
    if (status !== null && !VALID_STATUS.includes(status as (typeof VALID_STATUS)[number])) {
      return NextResponse.json(
        { ok: false, error: "invalid_status" },
        { status: 400 }
      );
    }
    const booking = await prisma.massageBooking.update({
      where: { id },
      data: { status: status || null },
    });
    return NextResponse.json({ ok: true, booking });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    return NextResponse.json({ ok: false, error: "unknown_error" }, { status: 500 });
  }
}
