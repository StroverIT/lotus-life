import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import type { Role } from "@/types/next-auth";

export type SessionWithRole = Awaited<ReturnType<typeof getServerSession>> & {
  user: { id?: string; email?: string | null; name?: string | null; image?: string | null; role?: Role };
};

/** Returns session or 401/403 response. Use in admin API routes. */
export async function requireAdminSession(): Promise<
  { session: SessionWithRole } | NextResponse
> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as { role?: Role }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return { session: session as SessionWithRole };
}
