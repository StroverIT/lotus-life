import Massage from "@/pages/Massage";

export const revalidate = 120; // 2 minutes — allow caching of RSC payload

export default function MassagePage() {
  return <Massage />;
}

