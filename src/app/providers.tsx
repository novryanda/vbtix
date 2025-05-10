// src/app/providers.tsx
"use client";

import { SWRConfig } from 'swr';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '~/components/ui/sonner';
import { fetcher } from '~/lib/api/client';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
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