import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isGuestSupabaseUser, upsertPrismaUserFromSupabase } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return NextResponse.json({ user: null, error: error.message }, { status: 200 });
  }

  const user = data.user;
  if (!user) return NextResponse.json({ user: null }, { status: 200 });

  if (isGuestSupabaseUser(user)) {
    return NextResponse.json({
      user: {
        kind: "guest",
        supabaseId: user.id,
      },
    });
  }

  const prismaUser = await upsertPrismaUserFromSupabase(user);

  return NextResponse.json({
    user: {
      kind: "user",
      supabaseId: user.id,
      prismaUserId: prismaUser?.id ?? null,
      email: prismaUser?.email ?? user.email ?? null,
      name: prismaUser?.name ?? null,
      role: prismaUser?.role ?? null,
      authType: prismaUser?.authType ?? null,
    },
  });
}

