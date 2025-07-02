"use client";

import React, { useState, useEffect } from "react";
import { Info, Copy, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { toast } from "sonner";

interface GuestSessionInfoProps {
  className?: string;
  showOrderLookupInfo?: boolean;
}

export function GuestSessionInfo({ 
  className = "", 
  showOrderLookupInfo = true 
}: GuestSessionInfoProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Get session ID from localStorage
    const storedSessionId = localStorage.getItem("vbticket_session_id");
    setSessionId(storedSessionId);
  }, []);

  const copySessionId = async () => {
    if (!sessionId) return;

    try {
      await navigator.clipboard.writeText(sessionId);
      setCopied(true);
      toast.success("Session ID copied to clipboard");
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy session ID");
    }
  };

  if (!sessionId) {
    return null;
  }

  return (
    <Card className={`border-blue-200 bg-blue-50/50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                Guest Session Active
              </h3>
              <p className="text-xs text-blue-700">
                You're shopping as a guest. Your session ID is:
              </p>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-white/70 rounded border border-blue-200">
              <code className="text-xs font-mono text-blue-800 flex-1 break-all">
                {sessionId}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={copySessionId}
                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
              >
                {copied ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>

            {showOrderLookupInfo && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-xs text-blue-700">
                  <strong>Important:</strong> Save this session ID or use the email you provide during checkout to track your orders later. You can lookup your orders anytime using the "Find My Order" feature.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
