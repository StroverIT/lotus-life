import UserPanel from "@/pages/UserPanel";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function MyAccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?redirect=/my-account");
  }

  return <UserPanel />;
}

