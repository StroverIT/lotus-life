import Admin from "@/pages/Admin";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { upsertPrismaUserFromSupabase, isGuestSupabaseUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) redirect("/login?redirect=/admin");
  if (isGuestSupabaseUser(user)) redirect("/login?redirect=/admin");

  const prismaUser = await upsertPrismaUserFromSupabase(user);
  if (!prismaUser || prismaUser.role !== "ADMIN") redirect("/");

  return <Admin />;
}

