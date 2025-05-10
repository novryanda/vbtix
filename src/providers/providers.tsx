"use client";

import { type ReactNode } from "react";
import { SessionProvider } from "./session-provider";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";
import { QueryProvider } from "./query-provider";
import { Toaster } from "~/components/ui/toaster";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="system" storageKey="vbtix-theme">
        <QueryProvider>
          <ToastProvider>
            {children}
            <Toaster />
          </ToastProvider>
        </QueryProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
