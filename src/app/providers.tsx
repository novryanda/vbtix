// src/app/providers.tsx
"use client";

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';
import { fetcher } from '~/lib/api/client';

export function Providers({ children }: ReactNode) {
    return (
        <SWRConfig
            value={{
                fetcher,
                revalidateOnFocus: true,
                revalidateOnReconnect: true,
                dedupingInterval: 5000,
            }}
        >
            {children}
        </SWRConfig>
    );
}