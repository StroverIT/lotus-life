import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Home } from "lucide-react";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";
import { AdminNav } from "./_components/AdminNav";

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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl text-charcoal">Admin</h1>
          <Button variant="outline" asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Home
            </Link>
          </Button>
        </div>
        <AdminNav />
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
