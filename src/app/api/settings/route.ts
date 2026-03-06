import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireAdmin } from "@/lib/apiAuth";

export const runtime = "nodejs";

export async function GET() {
  const settings = await prisma.siteSettings.findFirst({ orderBy: { id: "asc" } });
  return NextResponse.json(settings ?? null);
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const body = (await request.json()) as { defaultSeason?: "summer" | "winter" };

    const existing = await prisma.siteSettings.findFirst({ orderBy: { id: "asc" } });
    const saved = existing
      ? await prisma.siteSettings.update({
          where: { id: existing.id },
          data: { ...(body.defaultSeason ? { defaultSeason: body.defaultSeason } : {}) },
        })
      : await prisma.siteSettings.create({
          data: { defaultSeason: body.defaultSeason ?? "summer" },
        });

    return NextResponse.json({ ok: true, settings: saved });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    return NextResponse.json({ ok: false, error: "unknown_error" }, { status: 500 });
  }
}

