import Admin from "@/pages/Admin";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role as string | undefined;
  const guest = (session.user as any).guest as boolean | undefined;

  if (guest) {
    redirect("/login");
  }

  if (role !== "ADMIN") {
    redirect("/");
  }

  return <Admin />;
}

