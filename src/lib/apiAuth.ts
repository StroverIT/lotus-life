import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isGuestSupabaseUser, upsertPrismaUserFromSupabase } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function getAuthContext() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new AuthError(error.message, 401);

  const supabaseUser = data.user;
  if (!supabaseUser) throw new AuthError("not_authenticated", 401);

  const guest = isGuestSupabaseUser(supabaseUser);
  const prismaUser = guest ? null : await upsertPrismaUserFromSupabase(supabaseUser);

  return { supabaseUser, prismaUser, guest };
}

export async function requireUser() {
  const ctx = await getAuthContext();
  if (ctx.guest || !ctx.prismaUser) throw new AuthError("account_required", 401);
  return ctx;
}

export async function requireAdmin() {
  const ctx = await requireUser();
  if (ctx.prismaUser.role !== UserRole.ADMIN) throw new AuthError("admin_required", 403);
  return ctx;
}

