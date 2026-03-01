import type { Role } from "@/types/next-auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export interface StoredUser {
  email: string;
  password: string;
  name: string;
  role: Role;
}

const ADMIN_EMAILS = ["demo@lotuslife.com"];

export type AuthProvider = "credentials" | "google" | "facebook" | string;

export async function getUsers(): Promise<(Omit<StoredUser, "password"> & { provider?: AuthProvider })[]> {
  const users = await prisma.user.findMany({
    select: { email: true, name: true, role: true, provider: true },
  });
  return users.map((u) => ({ ...u, role: u.role as Role, provider: u.provider }));
}

export async function findUserByEmail(email: string): Promise<StoredUser | undefined> {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) return undefined;
  return {
    email: user.email,
    password: user.password ?? "",
    name: user.name,
    role: user.role as Role,
  };
}

export async function addUser(user: StoredUser): Promise<StoredUser> {
  const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
  const created = await prisma.user.create({
    data: {
      email: user.email,
      name: user.name,
      password: hashedPassword,
      role: user.role,
      provider: "credentials",
    },
  });
  return {
    email: created.email,
    password: user.password, // caller doesn't need hash
    name: created.name,
    role: created.role as Role,
  };
}

export async function updateUser(
  email: string,
  data: Partial<Pick<StoredUser, "name" | "role" | "password">>
): Promise<StoredUser | null> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) return null;
  const updateData: { name?: string; role?: string; password?: string } = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.password !== undefined && data.password.trim()) {
    updateData.password = await bcrypt.hash(data.password.trim(), SALT_ROUNDS);
  }
  const updated = await prisma.user.update({
    where: { email },
    data: updateData,
  });
  return {
    email: updated.email,
    password: updated.password ?? "",
    name: updated.name,
    role: updated.role as Role,
  };
}

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email);
}

/** Upsert user from OAuth (Google, Facebook, etc.). Called on sign-in. */
export async function upsertUserFromOAuth(
  email: string,
  name: string | null,
  image: string | null,
  provider: string
): Promise<{ email: string; name: string; role: Role }> {
  const role = isAdminEmail(email) ? "admin" : "user";
  const created = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: name ?? email.split("@")[0],
      password: null,
      role,
      provider: provider === "credentials" ? "credentials" : provider,
      image: image ?? null,
    },
    update: {
      name: name ?? undefined,
      image: image ?? undefined,
      provider: provider === "credentials" ? undefined : provider,
    },
  });
  return {
    email: created.email,
    name: created.name,
    role: created.role as Role,
  };
}
