"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { Button } from "~/components/ui/button";
import { RotateCcw, Camera, CameraOff } from "lucide-react";

interface CameraBarcodeScannerProps {
  onScan: (result: string) => void;
  onError: (error: string) => void;
  isScanning?: boolean;
  className?: string;
}

export function CameraBarcodeScanner({
  onScan,
  onError,
  isScanning = false,
  className,
}: CameraBarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [codeReader, setCodeReader] = useState<BrowserMultiFormatReader | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState<number>(0);

  // Initialize code reader
  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    setCodeReader(reader);

    return () => {
      reader.reset();
    };
  }, []);



  // Get available cameras using the correct API - SAME AS QR SCANNER
  const getDevices = useCallback(async () => {
    try {
      // Request permission first to get device labels
      await navigator.mediaDevices.getUserMedia({ video: true });

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');

      setDevices(videoDevices);

      if (videoDevices.length > 0 && !selectedDeviceId) {
        // Prefer back camera if available
        const backCamera = videoDevices.find(device =>
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        );
        setSelectedDeviceId(backCamera?.deviceId || videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error("Error getting video devices:", error);
      onError("Failed to access camera devices. Please ensure camera permissions are granted.");
    }
  }, [selectedDeviceId, onError]);

  // Start scanning - SIMPLIFIED LIKE QR SCANNER
  const startScanning = useCallback(async () => {
    if (!codeReader || !videoRef.current || isActive) return;

    try {
      setIsActive(true);
      setHasPermission(null);

      // Get devices first
      await getDevices();

      // Request camera with rear camera preference
      let constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      let stream: MediaStream;

      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (constraintError) {
        console.warn("Failed with rear camera, trying fallback:", constraintError);
        // Fallback to basic video
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Start decoding - same as QR scanner
      codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, error) => {
          if (result) {
            const now = Date.now();
            if (now - lastScanTime > 2000) {
              setLastScanTime(now);
              setScanCount(prev => prev + 1);
              onScan(result.getText());
            }
          }

          if (error && !(error instanceof NotFoundException)) {
            console.warn("Barcode scan error:", error);
          }
        }
      );

      setHasPermission(true);
    } catch (error) {
      console.error("Error starting barcode scanner:", error);
      setHasPermission(false);
      setIsActive(false);
      onError("Failed to start camera");
    }
  }, [codeReader, isActive, lastScanTime, onScan, onError, getDevices]);

  // Stop scanning
  const stopScanning = useCallback(() => {
    if (codeReader && isActive) {
      codeReader.reset();
      setIsActive(false);
    }
  }, [codeReader, isActive]);

  // Switch camera
  const switchCamera = useCallback(async () => {
    if (devices.length <= 1) return;

    const currentIndex = devices.findIndex(device => device.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDevice = devices[nextIndex];

    if (nextDevice) {
      const wasActive = isActive;
      if (wasActive) {
        stopScanning();
      }

      setSelectedDeviceId(nextDevice.deviceId);

      if (wasActive) {
        // Small delay to ensure camera is released
        setTimeout(() => {
          startScanning();
        }, 500);
      }
    }
  }, [devices, selectedDeviceId, isActive, stopScanning, startScanning]);



  // Handle scanning state changes
  useEffect(() => {
    if (isScanning && !isActive) {
      startScanning();
    } else if (!isScanning && isActive) {
      stopScanning();
    }
  }, [isScanning, isActive, startScanning, stopScanning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (codeReader) {
        codeReader.reset();
      }
    };
  }, [codeReader]);

  return (
    <div className={className}>
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full h-64 bg-black rounded-lg object-cover"
          playsInline
          muted
        />
        
        {/* Scanning overlay */}
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border-2 border-blue-500 w-48 h-24 rounded-lg relative">
              <div className="absolute inset-0 border-2 border-blue-400 animate-pulse rounded-lg"></div>
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
            </div>
          </div>
        )}

        {/* Status indicators */}
        {hasPermission === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="text-white text-center">
              <p className="text-lg font-semibold">Camera Permission Required</p>
              <p className="text-sm">Please allow camera access to scan barcodes</p>
            </div>
          </div>
        )}

        {!isActive && hasPermission && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="text-white text-center">
              <p className="text-lg font-semibold">Camera Ready</p>
              <p className="text-sm">Click scan to start barcode detection</p>
            </div>
          </div>
        )}

        {/* Camera switch button */}
        {devices.length > 1 && (
          <div className="absolute top-2 right-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={switchCamera}
              disabled={!hasPermission}
              className="bg-black/50 hover:bg-black/70 text-white border-white/20"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Camera information - SIMPLIFIED */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isActive ? (
            <Camera className="h-4 w-4 text-green-500" />
          ) : (
            <CameraOff className="h-4 w-4 text-gray-400" />
          )}
          <span className="text-sm text-gray-600">
            {devices.length > 0 ? (
              devices.find(d => d.deviceId === selectedDeviceId)?.label ||
              `Camera ${selectedDeviceId?.substring(0, 8) || 'default'}`
            ) : (
              "No camera detected"
            )}
          </span>
        </div>

        {devices.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={switchCamera}
            disabled={!hasPermission}
            className="text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Switch ({devices.length})
          </Button>
        )}
      </div>

      {/* Camera selection dropdown (for advanced users) */}
      {devices.length > 1 && (
        <details className="mt-2">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
            Advanced camera selection
          </summary>
          <div className="mt-2">
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              disabled={isActive}
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.substring(0, 8)}`}
                </option>
              ))}
            </select>
          </div>
        </details>
      )}

      {/* Scan statistics */}
      {scanCount > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Scans detected: {scanCount}
          </p>
        </div>
      )}
    </div>
  );
}
