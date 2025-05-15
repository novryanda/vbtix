"use client";

import * as React from "react";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";

interface ThemeSelectorProps extends React.HTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  align?: "center" | "start" | "end";
  side?: "top" | "right" | "bottom" | "left";
}

type ThemeOption = {
  value: "light" | "dark" | "system";
  label: string;
  icon: typeof Sun;
};

export function ThemeSelector({
  variant = "outline",
  size = "icon",
  align = "end",
  side = "bottom",
  className,
  ...props
}: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // After mounting, we have access to the theme
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }

  const themeOptions: ThemeOption[] = [
    {
      value: "light",
      label: "Light",
      icon: Sun,
    },
    {
      value: "dark",
      label: "Dark",
      icon: Moon,
    },
    {
      value: "system",
      label: "System",
      icon: Monitor,
    },
  ];

  // Get the current theme icon
  const getCurrentIcon = () => {
    if (theme === "system") return Monitor;
    return theme === "dark" ? Moon : Sun;
  };

  const ThemeIcon = getCurrentIcon();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn("relative", className)}
          {...props}
        >
          <ThemeIcon className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Select theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side}>
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isActive = theme === option.value;

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={cn(
                "flex min-w-32 items-center gap-2",
                isActive ? "font-medium" : "font-normal",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{option.label}</span>
              {isActive && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
