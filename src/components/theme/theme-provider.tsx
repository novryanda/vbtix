"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

/**
 * A wrapper component for the next-themes ThemeProvider
 * This allows us to use the ThemeProvider in our application
 * with our preferred configuration and proper hydration handling
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      suppressHydrationWarning
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
