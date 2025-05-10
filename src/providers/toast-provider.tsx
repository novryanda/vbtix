"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ToastProvider as ToastPrimitiveProvider, ToastViewport } from "~/components/ui/toast";

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <ToastPrimitiveProvider>
      {children}
      <ToastViewport />
    </ToastPrimitiveProvider>
  );
}
