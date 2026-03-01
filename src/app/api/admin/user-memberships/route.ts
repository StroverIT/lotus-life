import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import {
  getAllUserMemberships,
  setUserMembership,
  removeUserMembership,
} from "@/lib/userMembershipsStore";
import { getUsers } from "@/lib/usersStore";
import { getAllTiers } from "@/lib/pricingStore";

export async function GET() {
  const result = await requireAdminSession();
  if (result instanceof NextResponse) return result;
  const [assignments, users, tiers] = await Promise.all([
    getAllUserMemberships(),
    Promise.resolve(getUsers()),
    getAllTiers(),
  ]);
  const userMap = new Map(users.map((u) => [u.email, u]));
  const tierMap = new Map(tiers.map((t) => [t.id, t]));
  const list = assignments.map((a) => {
    const user = userMap.get(a.userId);
    const tier = tierMap.get(a.tierId);
    return {
      userId: a.userId,
      tierId: a.tierId,
      validFrom: a.validFrom,
      validTo: a.validTo,
      userEmail: user?.email,
      userName: user?.name,
      tierName: tier?.name,
    };
  });
  return NextResponse.json(list);
}

export async function PUT(request: NextRequest) {
  const result = await requireAdminSession();
  if (result instanceof NextResponse) return result;
  try {
    const body = await request.json();
    const { userId, tierId, validFrom, validTo } = body as {
      userId: string;
      tierId: string;
      validFrom?: string;
      validTo?: string;
    };
    if (!userId || !tierId) {
      return NextResponse.json(
        { error: "userId and tierId are required" },
        { status: 400 }
      );
    }
    const assignment = await setUserMembership({
      userId,
      tierId,
      validFrom,
      validTo,
    });
    return NextResponse.json(assignment);
  } catch (err) {
    console.error("PUT /api/admin/user-memberships", err);
    return NextResponse.json(
      { error: "Failed to set membership" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const result = await requireAdminSession();
  if (result instanceof NextResponse) return result;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json(
      { error: "userId query param is required" },
      { status: 400 }
    );
  }
  const ok = await removeUserMembership(userId);
  if (!ok) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
