import { cn } from "~/lib/utils";

interface RedirectLoadingProps {
  /** Custom message to display (default: "Redirecting...") */
  message?: string;
  /** Whether to show the message (default: true) */
  showMessage?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Size of the spinner (default: "default") */
  size?: "sm" | "default" | "lg";
}

/**
 * Shared loading component for redirect pages
 * Provides consistent styling and behavior across admin and organizer redirects
 */
export function RedirectLoading({
  message = "Redirecting...",
  showMessage = true,
  className,
  size = "default"
}: RedirectLoadingProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    default: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  const textSizeClasses = {
    sm: "text-sm",
    default: "text-base",
    lg: "text-lg"
  };

  return (
    <div className={cn(
      "flex h-screen w-full items-center justify-center",
      className
    )}>
      <div className="flex flex-col items-center gap-3">
        <div 
          className={cn(
            "animate-spin rounded-full border-b-2 border-primary",
            sizeClasses[size]
          )}
        />
        {showMessage && (
          <span className={cn(
            "text-muted-foreground",
            textSizeClasses[size]
          )}>
            {message}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Compact redirect loading for use within other components
 */
export function RedirectLoadingCompact({
  message = "Redirecting to dashboard...",
  className
}: Pick<RedirectLoadingProps, "message" | "className">) {
  return (
    <div className={cn(
      "flex items-center justify-center p-8",
      className
    )}>
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    </div>
  );
}
