import Memberships from "@/pages/Memberships";

export const revalidate = 120; // 2 minutes — allow caching of RSC payload

export default function MembershipsPage() {
  return <Memberships />;
}

