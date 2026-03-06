"use client";

import { ReactNode, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/context/ThemeContext";
import { PageAnimationsProvider } from "@/context/PageAnimationContext";
import { PendingModalProvider } from "@/context/PendingModalContext";

export function AppShellProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <PageAnimationsProvider>
            <PendingModalProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                {children}
              </TooltipProvider>
            </PendingModalProvider>
          </PageAnimationsProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

