import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { upsertPrismaUserFromSupabase } from "@/lib/auth";

export const runtime = "nodejs";

function getSupabaseClient(request: NextRequest, response: NextResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirect = url.searchParams.get("redirect") ?? "/";

  const redirectUrl = new URL(redirect, request.url);
  const response = NextResponse.redirect(redirectUrl);

  if (!code) return response;

  const supabase = getSupabaseClient(request, response);
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", redirect);
    loginUrl.searchParams.set("error", "oauth_exchange_failed");
    return NextResponse.redirect(loginUrl);
  }

  const { data } = await supabase.auth.getUser();
  if (data.user) {
    await upsertPrismaUserFromSupabase(data.user);
  }

  return response;
}

