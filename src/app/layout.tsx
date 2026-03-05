import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { AppShellProviders } from "./providers";

export const metadata: Metadata = {
  title: "Lotus Life",
  description: "Lotus Life yoga, massage & memberships in Bansko",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <AppShellProviders>{children}</AppShellProviders>
      </body>
    </html>
  );
}

