"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

interface EnvironmentData {
  [key: string]: string | number | boolean | null | undefined;
}

interface ApiStatus {
  success: boolean;
  message?: string;
  environment?: EnvironmentData;
  error?: string;
  timestamp?: string;
  uptime?: number;
}

interface ApiResponse extends ApiStatus {
  // This ensures the response structure matches what we expect
}

export function ApiStatus() {
  const [healthStatus, setHealthStatus] = useState<ApiStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const testHealth = async () => {
    setHealthLoading(true);
    try {
      const response = await fetch("/api/health");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = (await response.json()) as ApiResponse;
      setHealthStatus(data);
    } catch (error) {
      setHealthStatus({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to test health endpoint",
      });
    } finally {
      setHealthLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>API Health Status</CardTitle>
        <CardDescription>
          Test basic API functionality and environment setup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testHealth} disabled={healthLoading}>
          {healthLoading ? "Testing..." : "Test API Health"}
        </Button>

        {healthStatus && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={healthStatus.success ? "default" : "destructive"}>
                {healthStatus.success ? "✅ Healthy" : "❌ Failed"}
              </Badge>
              {healthStatus.timestamp && (
                <span className="text-muted-foreground text-sm">
                  {new Date(healthStatus.timestamp).toLocaleString()}
                </span>
              )}
            </div>

            {healthStatus.success && healthStatus.message && (
              <p className="text-sm text-green-700">{healthStatus.message}</p>
            )}

            {healthStatus.success && healthStatus.uptime !== undefined && (
              <p className="text-sm">
                Server uptime:{" "}
                <strong>{Math.round(healthStatus.uptime)}s</strong>
              </p>
            )}

            {healthStatus.error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-medium text-red-800">Error:</p>
                <p className="text-sm text-red-700">{healthStatus.error}</p>
              </div>
            )}

            {healthStatus.environment && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Environment Check:</p>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {Object.entries(healthStatus.environment).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span>{key}:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-xs">
                            {typeof value === "boolean"
                              ? value
                                ? "Set"
                                : "Not Set"
                              : String(value)}
                          </span>
                          <Badge
                            variant={
                              key.includes("EXISTS")
                                ? value
                                  ? "default"
                                  : "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {key.includes("EXISTS")
                              ? value
                                ? "✓"
                                : "✗"
                              : "ℹ"}
                          </Badge>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
