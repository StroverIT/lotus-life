import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { getUsers } from "@/lib/usersStore";

export async function GET() {
  const result = await requireAdminSession();
  if (result instanceof NextResponse) return result;
  const users = await getUsers();
  return NextResponse.json(users);
}
