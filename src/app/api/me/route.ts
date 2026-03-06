import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const userId = (session.user as any).id as string | undefined;
  const role = (session.user as any).role as string | undefined;
  const guest = (session.user as any).guest as boolean | undefined;

  if (guest || !userId) {
    return NextResponse.json({
      user: {
        kind: "guest",
        id: userId ?? null,
      },
    });
  }

  const prismaUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!prismaUser) {
    return NextResponse.json({
      user: {
        kind: "user",
        id: userId,
        email: session.user.email ?? null,
        name: session.user.name ?? null,
        role: role ?? "USER",
      },
    });
  }

  return NextResponse.json({
    user: {
      kind: "user",
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      role: prismaUser.role,
      authType: prismaUser.authType,
    },
  });
}

