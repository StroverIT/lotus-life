import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Admin | Lotus Life",
  description: "Admin panel for schedules, events, users, and memberships",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent("/admin")}`);
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") {
    return (
      <div className="min-h-screen bg-marble flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-semibold text-charcoal mb-2">Access denied</h1>
        <p className="text-charcoal-light mb-6">You do not have permission to view this page.</p>
        <Button asChild>
          <Link href="/panel">Back to account</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-marble">
      {children}
    </div>
  );
}
