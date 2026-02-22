import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Lotus Life",
  description: "Lotus Life – wellness and mindful living",
  authors: [{ name: "Lotus Life" }],
  openGraph: {
    title: "Lotus Life",
    description: "Lotus Life – wellness and mindful living",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
