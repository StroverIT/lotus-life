import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { upsertPrismaUserFromSupabase, isGuestSupabaseUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
  }

  const user = data.user;
  if (!user) return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });

  if (isGuestSupabaseUser(user)) {
    return NextResponse.json({ ok: true, kind: "guest" });
  }

  const prismaUser = await upsertPrismaUserFromSupabase(user);
  return NextResponse.json({ ok: true, kind: "user", user: prismaUser });
}

