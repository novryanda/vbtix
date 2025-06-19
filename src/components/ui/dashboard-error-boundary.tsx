"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { MagicCard } from "~/components/ui/magic-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface DashboardErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class DashboardErrorBoundary extends React.Component<
  DashboardErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: DashboardErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Dashboard Error Boundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <MagicCard className="border-0 bg-background/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-xl font-semibold text-red-900 dark:text-red-100">
              Terjadi Kesalahan
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              Tidak dapat memuat data dashboard. Silakan coba lagi.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={this.handleRetry}
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Coba Lagi
            </Button>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Detail Error (Development)
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </CardContent>
        </MagicCard>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useDashboardErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    console.error("Dashboard error:", error);
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}

// Simple error fallback component
export function DashboardErrorFallback({
  error,
  onRetry,
}: {
  error?: Error;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <AlertTriangle className="mb-2 h-8 w-8 text-muted-foreground" />
      <h3 className="mb-2 text-lg font-semibold">Data tidak tersedia</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Terjadi kesalahan saat memuat data. Silakan coba lagi.
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
