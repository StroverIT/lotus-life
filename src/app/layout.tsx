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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <AppShellProviders>{children}</AppShellProviders>
      </body>
    </html>
  );
}

