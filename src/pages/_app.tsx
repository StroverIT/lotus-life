import type { AppProps } from "next/app";
import "@/app/globals.css";
import { AppShellProviders } from "@/app/providers";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppShellProviders>
      <Component {...pageProps} />
    </AppShellProviders>
  );
}

