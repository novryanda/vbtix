"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "~/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";

interface ThemeToggleGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}

export function ThemeToggleGroup({
  variant = "outline",
  size = "default",
  className,
  ...props
}: ThemeToggleGroupProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // After mounting, we have access to the theme
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }

  return (
    <ToggleGroup
      type="single"
      value={theme}
      onValueChange={(value) => {
        if (value) setTheme(value as "light" | "dark" | "system");
      }}
      className={cn("justify-center", className)}
      {...props}
    >
      <ToggleGroupItem
        value="light"
        aria-label="Light mode"
        size={size}
        variant={variant}
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only md:not-sr-only md:ml-2">Light</span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="dark"
        aria-label="Dark mode"
        size={size}
        variant={variant}
      >
        <Moon className="h-4 w-4" />
        <span className="sr-only md:not-sr-only md:ml-2">Dark</span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="system"
        aria-label="System theme"
        size={size}
        variant={variant}
      >
        <Monitor className="h-4 w-4" />
        <span className="sr-only md:not-sr-only md:ml-2">System</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
