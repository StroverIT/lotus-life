import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { getAllTiers, addTier } from "@/lib/pricingStore";

export async function GET() {
  const result = await requireAdminSession();
  if (result instanceof NextResponse) return result;
  const tiers = getAllTiers();
  return NextResponse.json(tiers);
}

export async function POST(request: NextRequest) {
  const result = await requireAdminSession();
  if (result instanceof NextResponse) return result;
  try {
    const body = await request.json();
    const { id, name, price, features, highlighted } = body as {
      id?: string;
      name: string;
      price: number;
      features: string[];
      highlighted?: boolean;
    };
    if (!name || typeof price !== "number" || !Array.isArray(features)) {
      return NextResponse.json(
        { error: "name, price, and features are required" },
        { status: 400 }
      );
    }
    const tier = addTier({ id, name, price, features, highlighted });
    return NextResponse.json(tier);
  } catch (err) {
    console.error("POST /api/admin/tiers", err);
    return NextResponse.json(
      { error: "Failed to create tier" },
      { status: 500 }
    );
  }
}
