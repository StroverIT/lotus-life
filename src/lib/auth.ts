import type { User as SupabaseUser } from "@supabase/supabase-js";
import { AuthType, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function parseAdminEmailsFromEnv(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)
    .map(normalizeEmail);
}

function getProvider(user: SupabaseUser): string | undefined {
  const appMeta = user.app_metadata as unknown as Record<string, unknown> | null;
  const fromAppMeta = appMeta && typeof appMeta.provider === "string" ? appMeta.provider : undefined;

  const identities = (user as unknown as { identities?: Array<{ provider?: unknown }> }).identities;
  const fromIdentity =
    Array.isArray(identities) && typeof identities[0]?.provider === "string"
      ? (identities[0]!.provider as string)
      : undefined;

  return fromAppMeta ?? fromIdentity;
}

export function getAuthTypeFromSupabaseUser(user: SupabaseUser): AuthType {
  const provider = getProvider(user);
  if (provider === "google") return AuthType.GOOGLE;
  if (provider === "facebook") return AuthType.FACEBOOK;
  if (provider === "email") return AuthType.CREDENTIALS;
  return AuthType.CREDENTIALS;
}

export function isGuestSupabaseUser(user: SupabaseUser) {
  const email = user.email?.trim();
  return !email;
}

export async function upsertPrismaUserFromSupabase(user: SupabaseUser) {
  if (isGuestSupabaseUser(user)) return null;

  const email = normalizeEmail(user.email!);
  const meta = user.user_metadata as unknown as Record<string, unknown> | null;
  const metaFullName = meta && typeof meta.full_name === "string" ? meta.full_name : undefined;
  const metaName = meta && typeof meta.name === "string" ? meta.name : undefined;
  const name =
    metaFullName ??
    metaName ??
    email.split("@")[0] ??
    "User";

  const authType = getAuthTypeFromSupabaseUser(user);

  const adminEmails = parseAdminEmailsFromEnv();
  const shouldBeAdmin = adminEmails.includes(email);

  return prisma.user.upsert({
    where: { supabaseAuthId: user.id },
    update: {
      email,
      name,
      authType,
      ...(shouldBeAdmin ? { role: UserRole.ADMIN } : {}),
    },
    create: {
      supabaseAuthId: user.id,
      email,
      name,
      authType,
      role: shouldBeAdmin ? UserRole.ADMIN : UserRole.USER,
    },
  });
}

