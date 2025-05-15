// src/app/providers.tsx
"use client";

import { SWRConfig } from "swr";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "~/components/ui/sonner";
import { fetcher } from "~/lib/api/client";
import { ThemeProvider } from "~/components/theme/theme-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <SWRConfig
          value={{
            fetcher,
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
          }}
        >
          {children}
          <Toaster />
        </SWRConfig>
      </ThemeProvider>
    </SessionProvider>
  );
}
