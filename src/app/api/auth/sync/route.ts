import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const userId = (session.user as any).id as string | undefined;
  const role = (session.user as any).role as string | undefined;
  const guest = (session.user as any).guest as boolean | undefined;

  if (guest || !userId) {
    return NextResponse.json({ ok: true, kind: "guest" });
  }

  const prismaUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!prismaUser) {
    return NextResponse.json({
      ok: true,
      kind: "user",
      user: {
        id: userId,
        email: session.user.email ?? null,
        name: session.user.name ?? null,
        role: role ?? "USER",
      },
    });
  }

  return NextResponse.json({ ok: true, kind: "user", user: prismaUser });
}

