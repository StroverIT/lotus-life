import type { Role } from "@/types/next-auth";

export interface StoredUser {
  email: string;
  password: string;
  name: string;
  role: Role;
}

const ADMIN_EMAILS = ["demo@lotuslife.com"];

const users: StoredUser[] = [
  { email: "demo@lotuslife.com", password: "demo123", name: "Demo User", role: "admin" },
];

export function getUsers(): Omit<StoredUser, "password">[] {
  return users.map(({ password: _, ...u }) => u);
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return users.find((u) => u.email === email);
}

export function addUser(user: StoredUser): StoredUser {
  users.push(user);
  return user;
}

export function updateUser(
  email: string,
  data: Partial<Pick<StoredUser, "name" | "role" | "password">>
): StoredUser | null {
  const u = users.find((x) => x.email === email);
  if (!u) return null;
  if (data.name !== undefined) u.name = data.name;
  if (data.role !== undefined) u.role = data.role;
  if (data.password !== undefined && data.password.trim()) u.password = data.password.trim();
  return u;
}

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email);
}
