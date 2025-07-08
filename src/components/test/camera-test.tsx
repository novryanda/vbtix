"use client";

import { useState, useEffect } from "react";
import { MagicCard } from "~/components/ui/magic-card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { CameraBarcodeScanner } from "~/components/ui/camera-barcode-scanner";
import { CameraQRScanner } from "~/components/ui/camera-qr-scanner";
import {
  Camera,
  CameraOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Smartphone,
  Monitor,
  Wifi,
} from "lucide-react";

interface CameraTestProps {
  className?: string;
}

export function CameraTest({ className }: CameraTestProps) {
  const [deviceInfo, setDeviceInfo] = useState<{
    userAgent: string;
    isMobile: boolean;
    isSecure: boolean;
    hasMediaDevices: boolean;
    cameras: MediaDeviceInfo[];
  } | null>(null);
  
  const [testResults, setTestResults] = useState<{
    barcode: { success: boolean; message: string } | null;
    qr: { success: boolean; message: string } | null;
  }>({
    barcode: null,
    qr: null,
  });

  const [activeScanner, setActiveScanner] = useState<"barcode" | "qr" | null>(null);

  // Get device information
  useEffect(() => {
    const getDeviceInfo = async () => {
      const userAgent = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
      const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      
      let cameras: MediaDeviceInfo[] = [];
      
      if (hasMediaDevices) {
        try {
          // Request permission first
          await navigator.mediaDevices.getUserMedia({ video: true });
          const devices = await navigator.mediaDevices.enumerateDevices();
          cameras = devices.filter(device => device.kind === 'videoinput');
        } catch (error) {
          console.error("Error getting camera devices:", error);
        }
      }

      setDeviceInfo({
        userAgent,
        isMobile,
        isSecure,
        hasMediaDevices,
        cameras,
      });
    };

    getDeviceInfo();
  }, []);

  const handleBarcodeSuccess = (result: string) => {
    setTestResults(prev => ({
      ...prev,
      barcode: { success: true, message: `Barcode detected: ${result}` }
    }));
  };

  const handleBarcodeError = (error: string) => {
    setTestResults(prev => ({
      ...prev,
      barcode: { success: false, message: `Barcode error: ${error}` }
    }));
  };

  const handleQRSuccess = (result: string) => {
    setTestResults(prev => ({
      ...prev,
      qr: { success: true, message: `QR code detected: ${result}` }
    }));
  };

  const handleQRError = (error: string) => {
    setTestResults(prev => ({
      ...prev,
      qr: { success: false, message: `QR error: ${error}` }
    }));
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Device Information */}
        <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Device Information
            </h3>
            
            {deviceInfo && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {deviceInfo.isMobile ? (
                    <Smartphone className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Monitor className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="text-sm">
                    {deviceInfo.isMobile ? "Mobile Device" : "Desktop Device"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {deviceInfo.isSecure ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {deviceInfo.isSecure ? "Secure Context (HTTPS)" : "Insecure Context (HTTP)"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {deviceInfo.hasMediaDevices ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {deviceInfo.hasMediaDevices ? "Media Devices API Available" : "Media Devices API Not Available"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">
                    {deviceInfo.cameras.length} camera(s) detected
                  </span>
                </div>

                {deviceInfo.cameras.length > 0 && (
                  <div className="ml-6 space-y-1">
                    {deviceInfo.cameras.map((camera, index) => (
                      <div key={camera.deviceId} className="text-xs text-gray-600">
                        {index + 1}. {camera.label || `Camera ${camera.deviceId.substring(0, 8)}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </MagicCard>

        {/* Scanner Selection */}
        <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Camera Scanner Test</h3>
            
            <div className="flex gap-2 mb-4">
              <Button
                variant={activeScanner === "barcode" ? "default" : "outline"}
                onClick={() => setActiveScanner(activeScanner === "barcode" ? null : "barcode")}
              >
                Test Barcode Scanner
              </Button>
              <Button
                variant={activeScanner === "qr" ? "default" : "outline"}
                onClick={() => setActiveScanner(activeScanner === "qr" ? null : "qr")}
              >
                Test QR Scanner
              </Button>
            </div>

            {/* Test Results */}
            {(testResults.barcode || testResults.qr) && (
              <div className="space-y-2 mb-4">
                {testResults.barcode && (
                  <div className="flex items-center gap-2">
                    {testResults.barcode.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">{testResults.barcode.message}</span>
                  </div>
                )}
                {testResults.qr && (
                  <div className="flex items-center gap-2">
                    {testResults.qr.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">{testResults.qr.message}</span>
                  </div>
                )}
              </div>
            )}

            {/* Scanner Components */}
            {activeScanner === "barcode" && (
              <div>
                <h4 className="font-medium mb-2">Barcode Scanner Test</h4>
                <CameraBarcodeScanner
                  onScan={handleBarcodeSuccess}
                  onError={handleBarcodeError}
                  isScanning={true}
                />
              </div>
            )}

            {activeScanner === "qr" && (
              <div>
                <h4 className="font-medium mb-2">QR Code Scanner Test</h4>
                <CameraQRScanner
                  onScan={handleQRSuccess}
                  onError={handleQRError}
                  isScanning={true}
                />
              </div>
            )}
          </div>
        </MagicCard>

        {/* Troubleshooting Tips */}
        <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Troubleshooting Tips
            </h3>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Ensure you're using HTTPS or localhost for camera access</p>
              <p>• Grant camera permissions when prompted</p>
              <p>• Try switching between front and rear cameras using the switch button</p>
              <p>• Ensure good lighting for better scanning accuracy</p>
              <p>• Hold the camera steady and position codes within the frame</p>
              <p>• For mobile devices, use the rear camera for better focus</p>
            </div>
          </div>
        </MagicCard>
      </div>
    </div>
  );
}
