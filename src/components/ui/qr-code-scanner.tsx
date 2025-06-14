"use client";

import { useState, useRef, useCallback } from "react";
import { MagicCard } from "~/components/ui/magic-card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useQRCodeScanner } from "~/lib/api/hooks/qr-code";
import {
  Scan,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Ticket,
  Calendar,
  Clock,
  RefreshCw,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { formatDate } from "~/lib/utils";

export interface QRCodeScannerProps {
  organizerId: string;
  onScanSuccess?: (result: any) => void;
  onScanError?: (error: string) => void;
  className?: string;
}

interface ScanResult {
  success: boolean;
  message: string;
  ticket?: {
    id: string;
    checkedIn: boolean;
    checkInTime?: string;
    event: {
      title: string;
    };
    ticketType: {
      name: string;
    };
    holder: {
      fullName: string;
      email: string;
    };
  };
}

export function QRCodeScanner({
  organizerId,
  onScanSuccess,
  onScanError,
  className,
}: QRCodeScannerProps) {
  const [manualInput, setManualInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { scanAndValidate, scanAndCheckIn } = useQRCodeScanner(organizerId);

  const handleScan = useCallback(
    async (qrData: string, checkIn: boolean = false) => {
      if (!qrData.trim()) return;

      setIsScanning(true);
      setScanResult(null);

      try {
        const result = checkIn
          ? await scanAndCheckIn(qrData)
          : await scanAndValidate(qrData);

        setScanResult(result);
        setScanHistory((prev) => [result, ...prev.slice(0, 9)]); // Keep last 10 scans

        if (result.success) {
          onScanSuccess?.(result);
          if (checkIn) {
            setManualInput(""); // Clear input after successful check-in
          }
        } else {
          onScanError?.(result.message);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Scan failed";
        const errorResult = {
          success: false,
          message: errorMessage,
        };
        setScanResult(errorResult);
        setScanHistory((prev) => [errorResult, ...prev.slice(0, 9)]);
        onScanError?.(errorMessage);
      } finally {
        setIsScanning(false);
      }
    },
    [organizerId, scanAndValidate, scanAndCheckIn, onScanSuccess, onScanError]
  );

  const handleManualScan = (checkIn: boolean = false) => {
    handleScan(manualInput, checkIn);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleManualScan(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Scanner Interface */}
      <MagicCard
        className="border-0 bg-background/50 backdrop-blur-sm"
        gradientColor="rgba(59, 130, 246, 0.1)"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">QR Code Scanner</h3>
          </div>

          {/* Manual Input */}
          <div className="space-y-2">
            <Label htmlFor="qr-input">
              Scan or paste QR code data
            </Label>
            <Textarea
              ref={inputRef}
              id="qr-input"
              placeholder="Paste QR code data here or use camera to scan..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="min-h-[100px] font-mono text-sm"
              disabled={isScanning}
            />
            <p className="text-xs text-gray-500">
              Tip: Press Ctrl+Enter to validate, or use the buttons below
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleManualScan(false)}
              disabled={!manualInput.trim() || isScanning}
              className="flex-1"
            >
              {isScanning ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <AlertCircle className="w-4 h-4 mr-2" />
              )}
              Validate Only
            </Button>
            <Button
              onClick={() => handleManualScan(true)}
              disabled={!manualInput.trim() || isScanning}
              className="flex-1"
            >
              {isScanning ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Check In
            </Button>
          </div>
        </div>
      </MagicCard>

      {/* Scan Result */}
      {scanResult && (
        <ScanResultDisplay result={scanResult} />
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <MagicCard
          className="border-0 bg-background/50 backdrop-blur-sm"
          gradientColor="rgba(59, 130, 246, 0.1)"
        >
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Recent Scans</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {scanHistory.map((result, index) => (
                <ScanHistoryItem key={index} result={result} />
              ))}
            </div>
          </div>
        </MagicCard>
      )}
    </div>
  );
}

function ScanResultDisplay({ result }: { result: ScanResult }) {
  const isSuccess = result.success;
  const ticket = result.ticket;

  return (
    <MagicCard
      className={cn(
        "border-0 backdrop-blur-sm",
        isSuccess
          ? "bg-green-50/50 border-green-200"
          : "bg-red-50/50 border-red-200"
      )}
      gradientColor={isSuccess ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)"}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          {isSuccess ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <h3 className={cn(
            "text-lg font-semibold",
            isSuccess ? "text-green-800" : "text-red-800"
          )}>
            {isSuccess ? "Valid Ticket" : "Invalid Ticket"}
          </h3>
        </div>

        <p className={cn(
          "text-sm",
          isSuccess ? "text-green-700" : "text-red-700"
        )}>
          {result.message}
        </p>

        {ticket && (
          <div className="space-y-3 pt-2 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-gray-600">Event</Label>
                <p className="font-medium">{ticket.event.title}</p>
              </div>
              <div>
                <Label className="text-gray-600">Ticket Type</Label>
                <p className="font-medium">{ticket.ticketType.name}</p>
              </div>
              <div>
                <Label className="text-gray-600">Holder</Label>
                <p className="font-medium">{ticket.holder.fullName}</p>
                <p className="text-xs text-gray-500">{ticket.holder.email}</p>
              </div>
              <div>
                <Label className="text-gray-600">Status</Label>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={ticket.checkedIn ? "default" : "secondary"}
                    className={
                      ticket.checkedIn
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {ticket.checkedIn ? "Checked In" : "Not Checked In"}
                  </Badge>
                </div>
                {ticket.checkInTime && (
                  <p className="text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {formatDate(ticket.checkInTime)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MagicCard>
  );
}

function ScanHistoryItem({ result }: { result: ScanResult }) {
  const isSuccess = result.success;

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border",
      isSuccess
        ? "bg-green-50 border-green-200"
        : "bg-red-50 border-red-200"
    )}>
      {isSuccess ? (
        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium truncate",
          isSuccess ? "text-green-800" : "text-red-800"
        )}>
          {result.ticket?.holder.fullName || "Unknown"}
        </p>
        <p className={cn(
          "text-xs truncate",
          isSuccess ? "text-green-600" : "text-red-600"
        )}>
          {result.message}
        </p>
      </div>
      <div className="text-xs text-gray-500">
        {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
