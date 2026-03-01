import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { getTierById, updateTier, deleteTier } from "@/lib/pricingStore";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdminSession();
  if (result instanceof NextResponse) return result;
  const { id } = await params;
  const tier = getTierById(id);
  if (!tier) return NextResponse.json({ error: "Tier not found" }, { status: 404 });
  return NextResponse.json(tier);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdminSession();
  if (result instanceof NextResponse) return result;
  const { id } = await params;
  try {
    const body = await request.json();
    const updated = updateTier(id, body as Partial<{ name: string; price: number; features: string[]; highlighted: boolean }>);
    if (!updated) return NextResponse.json({ error: "Tier not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/admin/tiers/[id]", err);
    return NextResponse.json(
      { error: "Failed to update tier" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdminSession();
  if (result instanceof NextResponse) return result;
  const { id } = await params;
  const ok = deleteTier(id);
  if (!ok) return NextResponse.json({ error: "Tier not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
