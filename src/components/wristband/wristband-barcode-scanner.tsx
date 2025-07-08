"use client";

import { useState, useRef, useCallback } from "react";
import { MagicCard } from "~/components/ui/magic-card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useWristbandBarcodeScanner } from "~/lib/api/hooks/qr-code";
import { CameraBarcodeScanner } from "~/components/ui/camera-barcode-scanner";
import {
  Scan,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
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
    codeType: string;
  };
  scanLog?: {
    id: string;
    scannedAt: Date;
    scanResult: string;
  };
  message?: string;
  error?: string;
}

interface WristbandBarcodeScannerProps {
  organizerId: string;
  onScanSuccess?: (result: WristbandScanResult) => void;
  onScanError?: (error: string) => void;
  className?: string;
}

export function WristbandBarcodeScanner({
  organizerId,
  onScanSuccess,
  onScanError,
  className,
}: WristbandBarcodeScannerProps) {
  const [manualInput, setManualInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<WristbandScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<WristbandScanResult[]>([]);
  const [scanMode, setScanMode] = useState<"camera" | "manual">("camera");
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [validatedWristband, setValidatedWristband] = useState<any>(null);
  const [validatedBarcodeData, setValidatedBarcodeData] = useState<string>("");
  const [isConfirming, setIsConfirming] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { validateBarcode, scanBarcode } = useWristbandBarcodeScanner();

  // Handle camera scan
  const handleCameraScan = useCallback(async (barcodeData: string) => {
    if (!barcodeData.trim()) return;

    setIsScanning(true);
    try {
      // First validate the barcode
      const result = await validateBarcode(organizerId, {
        barcodeData,
        codeType: "BARCODE",
        scan: false,
      });

      if (result.success && result.data?.wristband) {
        setValidatedWristband(result.data.wristband);
        setValidatedBarcodeData(barcodeData);
        setScanResult(null);
      } else {
        setScanResult({
          success: false,
          error: result.error || "Invalid barcode",
        });
        setValidatedWristband(null);
        onScanError?.(result.error || "Invalid barcode");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Scan failed";
      setScanResult({
        success: false,
        error: errorMessage,
      });
      onScanError?.(errorMessage);
    } finally {
      setIsScanning(false);
    }
  }, [organizerId, validateBarcode, onScanError]);

  // Handle manual input scan
  const handleManualScan = async () => {
    if (!manualInput.trim()) return;

    setIsScanning(true);
    try {
      // First validate the barcode
      const result = await validateBarcode(organizerId, {
        barcodeData: manualInput.trim(),
        codeType: "BARCODE",
        scan: false,
      });

      if (result.success && result.data?.wristband) {
        setValidatedWristband(result.data.wristband);
        setValidatedBarcodeData(manualInput.trim());
        setScanResult(null);
        setManualInput("");
      } else {
        setScanResult({
          success: false,
          error: result.error || "Invalid barcode",
        });
        setValidatedWristband(null);
        onScanError?.(result.error || "Invalid barcode");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Validation failed";
      setScanResult({
        success: false,
        error: errorMessage,
      });
      onScanError?.(errorMessage);
    } finally {
      setIsScanning(false);
    }
  };

  // Confirm and record the scan
  const handleConfirmScan = async () => {
    if (!validatedWristband || !validatedBarcodeData) return;

    setIsConfirming(true);
    try {
      const result = await scanBarcode(organizerId, {
        barcodeData: validatedBarcodeData,
        codeType: "BARCODE",
        scan: true,
        scanLocation: "Wristband Scanner",
        scanDevice: "Web Interface",
      });

      if (result.success) {
        const scanResult: WristbandScanResult = {
          success: true,
          wristband: result.data?.wristband,
          scanLog: result.data?.scanLog,
          message: "Wristband scanned successfully",
        };

        setScanResult(scanResult);
        setScanHistory(prev => [scanResult, ...prev.slice(0, 9)]);
        setValidatedWristband(null);
        setValidatedBarcodeData("");
        onScanSuccess?.(scanResult);
      } else {
        setScanResult({
          success: false,
          error: result.error || "Scan failed",
        });
        onScanError?.(result.error || "Scan failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Scan failed";
      setScanResult({
        success: false,
        error: errorMessage,
      });
      onScanError?.(errorMessage);
    } finally {
      setIsConfirming(false);
    }
  };

  // Cancel scan
  const handleCancelScan = () => {
    setValidatedWristband(null);
    setValidatedBarcodeData("");
    setScanResult(null);
  };

  // Get result icon
  const getResultIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Scanner Mode Toggle */}
      <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Barcode Scanner</h3>
          <div className="flex gap-2">
            <Button
              variant={scanMode === "camera" ? "default" : "outline"}
              onClick={() => setScanMode("camera")}
              className="flex-1"
            >
              <Camera className="mr-2 h-4 w-4" />
              Camera
            </Button>
            <Button
              variant={scanMode === "manual" ? "default" : "outline"}
              onClick={() => setScanMode("manual")}
              className="flex-1"
            >
              <Keyboard className="mr-2 h-4 w-4" />
              Manual
            </Button>
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
              Use your device camera to scan wristband barcodes for verification.
            </p>

            <CameraBarcodeScanner
              onScan={handleCameraScan}
              onError={(error) => onScanError?.(error)}
              isScanning={cameraEnabled}
            />

            <Button
              onClick={() => setCameraEnabled(!cameraEnabled)}
              variant={cameraEnabled ? "destructive" : "default"}
              className="w-full"
            >
              {cameraEnabled ? (
                <>
                  <CameraOff className="mr-2 h-4 w-4" />
                  Stop Camera
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Start Camera
                </>
              )}
            </Button>
          </div>
        </MagicCard>
      )}

      {/* Manual Input */}
      {scanMode === "manual" && (
        <MagicCard
          className="border-0 bg-background/50 backdrop-blur-sm"
          gradientColor="rgba(34, 197, 94, 0.1)"
        >
          <div className="p-6 space-y-4">
            <h4 className="font-semibold">Manual Input</h4>
            <p className="text-sm text-muted-foreground">
              Enter or paste the barcode data manually for verification.
            </p>

            <div className="space-y-2">
              <Label htmlFor="manual-barcode">Barcode Data</Label>
              <Textarea
                ref={inputRef}
                id="manual-barcode"
                placeholder="Enter barcode data (e.g., WB-12345678-ABCD1234)"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Button
              onClick={handleManualScan}
              disabled={!manualInput.trim() || isScanning}
              className="w-full"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Scan className="mr-2 h-4 w-4" />
                  Validate Barcode
                </>
              )}
            </Button>
          </div>
        </MagicCard>
      )}

      {/* Validated Wristband (Confirmation) */}
      {validatedWristband && (
        <MagicCard
          className="border-0 bg-background/50 backdrop-blur-sm border-l-4 border-l-green-500"
          gradientColor="rgba(34, 197, 94, 0.1)"
        >
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <h4 className="font-semibold text-green-700">Valid Wristband</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">{validatedWristband.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Event</p>
                <p className="text-sm text-muted-foreground">{validatedWristband.eventTitle}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Scan Count</p>
                <p className="text-sm text-muted-foreground">
                  {validatedWristband.scanCount}
                  {validatedWristband.maxScans && ` / ${validatedWristband.maxScans}`}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant="outline" className="text-xs">
                  {validatedWristband.status}
                </Badge>
              </div>
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
          gradientColor={scanResult.success ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)"}
        >
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              {getResultIcon(scanResult.success)}
              <h4 className={cn(
                "font-semibold",
                scanResult.success ? "text-green-700" : "text-red-700"
              )}>
                {scanResult.success ? "Scan Successful" : "Scan Failed"}
              </h4>
            </div>

            {scanResult.success && scanResult.wristband && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Wristband</p>
                  <p className="text-sm text-muted-foreground">{scanResult.wristband.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Event</p>
                  <p className="text-sm text-muted-foreground">{scanResult.wristband.eventTitle}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">New Scan Count</p>
                  <p className="text-sm text-muted-foreground">
                    {scanResult.wristband.scanCount}
                    {scanResult.wristband.maxScans && ` / ${scanResult.wristband.maxScans}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Scanned At</p>
                  <p className="text-sm text-muted-foreground">
                    {scanResult.scanLog ? formatDate(scanResult.scanLog.scannedAt) : "Just now"}
                  </p>
                </div>
              </div>
            )}

            {!scanResult.success && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{scanResult.error}</p>
              </div>
            )}
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
                  <Badge variant="outline" className="text-xs">
                    <BarChart3 className="mr-1 h-3 w-3" />
                    Barcode
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </MagicCard>
      )}
    </div>
  );
}
