"use client";

import { useState, useRef, useCallback } from "react";
import { MagicCard } from "~/components/ui/magic-card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useWristbandQRScanner } from "~/lib/api/hooks/qr-code";
import { CameraQRScanner } from "~/components/ui/camera-qr-scanner";
import {
  Scan,
  CheckCircle,
  XCircle,
  AlertCircle,
  QrCode,
  Calendar,
  Clock,
  RefreshCw,
  Camera,
  CameraOff,
  Keyboard,
  Users,
  Shield,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { formatDate } from "~/lib/utils";

interface WristbandScanResult {
  success: boolean;
  wristband?: {
    id: string;
    name: string;
    description?: string;
    eventId: string;
    eventTitle: string;
    scanCount: number;
    maxScans?: number;
    isReusable: boolean;
    validFrom?: Date;
    validUntil?: Date;
    status: string;
  };
  scanLog?: {
    id: string;
    scannedAt: Date;
    scanResult: string;
  };
  message?: string;
  error?: string;
}

interface WristbandQRScannerProps {
  organizerId: string;
  onScanSuccess?: (result: WristbandScanResult) => void;
  onScanError?: (error: string) => void;
  className?: string;
}

export function WristbandQRScanner({
  organizerId,
  onScanSuccess,
  onScanError,
  className,
}: WristbandQRScannerProps) {
  const [manualInput, setManualInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<WristbandScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<WristbandScanResult[]>([]);
  const [scanMode, setScanMode] = useState<"camera" | "manual">("camera");
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [validatedWristband, setValidatedWristband] = useState<any>(null);
  const [validatedQRData, setValidatedQRData] = useState<string>("");
  const [isConfirming, setIsConfirming] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { validateWristband, scanWristband } = useWristbandQRScanner(organizerId);

  const handleCameraScan = useCallback(
    async (qrData: string) => {
      if (isScanning) return;
      
      setIsScanning(true);
      try {
        // First validate the wristband
        const result = await validateWristband(qrData);
        
        const scanResult: WristbandScanResult = {
          success: result.success,
          wristband: result.data?.wristband,
          message: result.data?.message,
          error: result.error,
        };

        setScanResult(scanResult);
        setValidatedWristband(result.data?.wristband);
        setValidatedQRData(qrData);

        if (result.success) {
          onScanSuccess?.(scanResult);
        } else {
          onScanError?.(result.error || "Validation failed");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Scan failed";
        const scanResult: WristbandScanResult = {
          success: false,
          error: errorMessage,
        };
        
        setScanResult(scanResult);
        onScanError?.(errorMessage);
      } finally {
        setIsScanning(false);
      }
    },
    [isScanning, validateWristband, onScanSuccess, onScanError]
  );

  const handleManualScan = async () => {
    if (!manualInput.trim() || isScanning) return;

    await handleCameraScan(manualInput.trim());
    setManualInput("");
  };

  const handleConfirmScan = async () => {
    if (!validatedQRData || !validatedWristband || isConfirming) return;

    setIsConfirming(true);
    try {
      const result = await scanWristband(validatedQRData);
      
      const scanResult: WristbandScanResult = {
        success: result.success,
        wristband: result.data?.wristband,
        scanLog: result.data?.scanLog,
        message: result.data?.message,
        error: result.error,
      };

      setScanResult(scanResult);
      setScanHistory(prev => [scanResult, ...prev.slice(0, 9)]); // Keep last 10 scans
      
      // Clear validation state
      setValidatedWristband(null);
      setValidatedQRData("");

      if (result.success) {
        onScanSuccess?.(scanResult);
      } else {
        onScanError?.(result.error || "Scan failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Scan confirmation failed";
      onScanError?.(errorMessage);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelScan = () => {
    setValidatedWristband(null);
    setValidatedQRData("");
    setScanResult(null);
  };

  const getResultIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Scanner Header */}
      <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Wristband Verification</h3>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={scanMode === "camera" ? "default" : "outline"}
                size="sm"
                onClick={() => setScanMode("camera")}
              >
                <Camera className="mr-2 h-4 w-4" />
                Camera
              </Button>
              <Button
                variant={scanMode === "manual" ? "default" : "outline"}
                size="sm"
                onClick={() => setScanMode("manual")}
              >
                <Keyboard className="mr-2 h-4 w-4" />
                Manual
              </Button>
            </div>
          </div>
        </div>
      </MagicCard>

      {/* Camera Scanner */}
      {scanMode === "camera" && (
        <MagicCard
          className="border-0 bg-background/50 backdrop-blur-sm"
          gradientColor="rgba(59, 130, 246, 0.1)"
        >
          <div className="p-6 space-y-4">
            <h4 className="font-semibold">Camera Scanner</h4>
            <p className="text-sm text-muted-foreground">
              Use your device camera to scan wristband QR codes for verification.
            </p>

            <CameraQRScanner
              onScan={handleCameraScan}
              onError={(error) => onScanError?.(error)}
              isScanning={isScanning}
            />
          </div>
        </MagicCard>
      )}

      {/* Manual Input */}
      {scanMode === "manual" && (
        <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
          <div className="p-6 space-y-4">
            <h4 className="font-semibold">Manual Input</h4>
            <p className="text-sm text-muted-foreground">
              Enter or paste the QR code data manually.
            </p>

            <div className="space-y-3">
              <Label htmlFor="manual-qr">QR Code Data</Label>
              <Textarea
                id="manual-qr"
                ref={inputRef}
                placeholder="Paste QR code data here..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="min-h-[100px] font-mono text-sm"
              />
              <Button
                onClick={handleManualScan}
                disabled={!manualInput.trim() || isScanning}
                className="w-full"
              >
                <Scan className="mr-2 h-4 w-4" />
                Verify Wristband
              </Button>
            </div>
          </div>
        </MagicCard>
      )}

      {/* Validation Result & Confirmation */}
      {validatedWristband && (
        <MagicCard className="border-0 bg-background/50 backdrop-blur-sm border-l-4 border-l-blue-500">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold">Wristband Verified</h4>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{validatedWristband.name}</span>
                <Badge variant="default">Valid</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Event:</span>
                  <p className="font-medium">{validatedWristband.eventTitle}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Scan Count:</span>
                  <p className="font-medium">
                    {validatedWristband.scanCount}
                    {validatedWristband.maxScans && ` / ${validatedWristband.maxScans}`}
                  </p>
                </div>
              </div>

              {validatedWristband.description && (
                <p className="text-sm text-muted-foreground">
                  {validatedWristband.description}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleConfirmScan}
                disabled={isConfirming}
                className="flex-1"
              >
                {isConfirming ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Recording Scan...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Record Scan
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelScan}
                disabled={isConfirming}
              >
                Cancel
              </Button>
            </div>
          </div>
        </MagicCard>
      )}

      {/* Scan Result */}
      {scanResult && !validatedWristband && (
        <MagicCard
          className={cn(
            "border-0 bg-background/50 backdrop-blur-sm border-l-4",
            scanResult.success ? "border-l-green-500" : "border-l-red-500"
          )}
        >
          <div className="p-6">
            <div className="flex items-start gap-3">
              {getResultIcon(scanResult.success)}
              <div className="flex-1">
                <h4 className="font-semibold mb-2">
                  {scanResult.success ? "Scan Successful" : "Scan Failed"}
                </h4>
                
                {scanResult.success && scanResult.wristband ? (
                  <div className="space-y-2">
                    <p className="font-medium">{scanResult.wristband.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Event: {scanResult.wristband.eventTitle}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Scans: {scanResult.wristband.scanCount}
                      {scanResult.wristband.maxScans && ` / ${scanResult.wristband.maxScans}`}
                    </p>
                    {scanResult.scanLog && (
                      <p className="text-xs text-muted-foreground">
                        Recorded at {formatDate(scanResult.scanLog.scannedAt)}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {scanResult.error || "Unknown error occurred"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </MagicCard>
      )}

      {/* Recent Scans */}
      {scanHistory.length > 0 && (
        <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
          <div className="p-6">
            <h4 className="font-semibold mb-4">Recent Scans</h4>
            <div className="space-y-2">
              {scanHistory.slice(0, 5).map((scan, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
                >
                  {getResultIcon(scan.success)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {scan.wristband?.name || "Unknown Wristband"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {scan.scanLog ? formatDate(scan.scanLog.scannedAt) : "Validation only"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </MagicCard>
      )}
    </div>
  );
}
