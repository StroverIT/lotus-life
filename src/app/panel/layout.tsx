import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account | Lotus Life",
  description: "Your visits and membership",
};

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-marble">
      {children}
    </div>
  );
}
