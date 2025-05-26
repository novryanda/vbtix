"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

interface ApiStatus {
  success: boolean;
  message?: string;
  environment?: Record<string, any>;
  error?: string;
  timestamp?: string;
  uptime?: number;
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
      const data = await response.json();
      setHealthStatus(data);
    } catch (error) {
      setHealthStatus({
        success: false,
        error: error instanceof Error ? error.message : "Failed to test health endpoint"
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
                <span className="text-sm text-muted-foreground">
                  {new Date(healthStatus.timestamp).toLocaleString()}
                </span>
              )}
            </div>

            {healthStatus.success && healthStatus.message && (
              <p className="text-sm text-green-700">
                {healthStatus.message}
              </p>
            )}

            {healthStatus.success && healthStatus.uptime !== undefined && (
              <p className="text-sm">
                Server uptime: <strong>{Math.round(healthStatus.uptime)}s</strong>
              </p>
            )}

            {healthStatus.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800 font-medium">Error:</p>
                <p className="text-sm text-red-700">{healthStatus.error}</p>
              </div>
            )}

            {healthStatus.environment && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Environment Check:</p>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {Object.entries(healthStatus.environment).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span>{key}:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {typeof value === 'boolean' ? (value ? 'Set' : 'Not Set') : String(value)}
                        </span>
                        <Badge 
                          variant={
                            key.includes('EXISTS') 
                              ? (value ? "default" : "destructive")
                              : "secondary"
                          } 
                          className="text-xs"
                        >
                          {key.includes('EXISTS') ? (value ? "✓" : "✗") : "ℹ"}
                        </Badge>
                      </div>
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
