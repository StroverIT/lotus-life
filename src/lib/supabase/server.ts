import { createServerClient } from "@supabase/ssr";

export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  // We now use NextAuth for authentication; Supabase is only used as Postgres via Prisma.
  // The cookie adapter is not needed, so we let the client manage cookies internally.
  return createServerClient(url, anonKey);
}

