import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function getAuthContext() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new AuthError("not_authenticated", 401);
  }

  const userId = (session.user as any).id as string | undefined;
  const guest = (session.user as any).guest as boolean | undefined;

  if (guest || !userId) {
    return { session, prismaUser: null, guest: true };
  }

  const prismaUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!prismaUser) {
    return { session, prismaUser: null, guest: true };
  }

  return { session, prismaUser, guest: false };
}

export async function requireUser() {
  const ctx = await getAuthContext();
  if (ctx.guest || !ctx.prismaUser) throw new AuthError("account_required", 401);
  return ctx;
}

export async function requireAdmin() {
  const ctx = await requireUser();
  if (ctx.prismaUser.role !== "ADMIN") throw new AuthError("admin_required", 403);
  return ctx;
}

