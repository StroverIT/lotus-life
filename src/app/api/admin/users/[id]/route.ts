import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { updateUser, findUserByEmail } from "@/lib/usersStore";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdminSession();
  if (result instanceof NextResponse) return result;
  const { id } = await params;
  const user = findUserByEmail(id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  try {
    const body = await request.json();
    const { name, role, password } = body as {
      name?: string;
      role?: "user" | "admin";
      password?: string;
    };
    const updated = updateUser(id, { name, role, password });
    if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const { password: _p, ...safe } = updated;
    return NextResponse.json(safe);
  } catch (err) {
    console.error("PATCH /api/admin/users/[id]", err);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
