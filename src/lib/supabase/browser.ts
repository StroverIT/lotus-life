import { createBrowserClient } from "@supabase/ssr";

export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    // During static generation / server evaluation (Pages Router), client-only modules can still be evaluated.
    // We avoid crashing the build and will throw when actually used in the browser.
    if (typeof window !== "undefined") {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }
    return createBrowserClient("http://localhost:54321", "public-anon-key");
  }
  return createBrowserClient(url, anonKey);
}

