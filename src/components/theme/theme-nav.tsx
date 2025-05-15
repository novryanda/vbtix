"use client";

import Link from "next/link";
import { ThemeSelector } from "~/components/ui/theme-selector";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface ThemeNavProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "selector" | "toggle";
  showDemo?: boolean;
}

/**
 * A navigation component that includes a theme toggle or selector
 * This can be used in your application's navigation bar
 */
export function ThemeNav({
  variant = "toggle",
  showDemo = true,
  className,
  ...props
}: ThemeNavProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {variant === "toggle" ? <ThemeToggle /> : <ThemeSelector />}
      
      {showDemo && (
        <Button variant="outline" size="sm" asChild>
          <Link href="/theme-demo">Theme Demo</Link>
        </Button>
      )}
    </div>
  );
}
