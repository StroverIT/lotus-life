import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { getUserMembership } from "@/lib/userMembershipsStore";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const assignment = await getUserMembership(session.user.id);
  return NextResponse.json({ tierId: assignment?.tierId ?? null });
}
