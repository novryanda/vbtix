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

interface EnvironmentVariables {
  [key: string]: string | number | boolean | null | undefined;
}

interface DatabaseStatus {
  success: boolean;
  userCount?: number;
  environment?: EnvironmentVariables;
  error?: string;
  timestamp?: string;
}

interface DatabaseResponse extends DatabaseStatus {
  // This ensures the response structure matches what we expect
}

export function DatabaseStatus() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/test-db");
      const data = (await response.json()) as DatabaseResponse;
      setStatus(data);
    } catch (error) {
      setStatus({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to test connection",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Database Connection Status</CardTitle>
        <CardDescription>
          Test your database connection and environment variables
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testConnection} disabled={loading}>
          {loading ? "Testing..." : "Test Database Connection"}
        </Button>

        {status && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={status.success ? "default" : "destructive"}>
                {status.success ? "✅ Connected" : "❌ Failed"}
              </Badge>
              {status.timestamp && (
                <span className="text-muted-foreground text-sm">
                  {new Date(status.timestamp).toLocaleString()}
                </span>
              )}
            </div>

            {status.success && status.userCount !== undefined && (
              <p className="text-sm">
                Found <strong>{status.userCount}</strong> users in database
              </p>
            )}

            {status.error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-medium text-red-800">Error:</p>
                <p className="text-sm text-red-700">{status.error}</p>
              </div>
            )}

            {status.environment && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Environment Variables:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(status.environment).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span>{key}:</span>
                      <Badge
                        variant={value ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {value ? "✓" : "✗"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
