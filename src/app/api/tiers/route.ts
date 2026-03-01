import { NextResponse } from "next/server";
import { getAllTiers } from "@/lib/pricingStore";

export async function GET() {
  try {
    const tiers = await getAllTiers();
    return NextResponse.json(tiers);
  } catch (err) {
    console.error("GET /api/tiers", err);
    return NextResponse.json(
      { error: "Failed to load tiers" },
      { status: 500 }
    );
  }
}
