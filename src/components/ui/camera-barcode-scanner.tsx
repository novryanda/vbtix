"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

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

  // Get available video devices
  useEffect(() => {
    if (codeReader) {
      codeReader
        .listVideoInputDevices()
        .then((videoInputDevices) => {
          setDevices(videoInputDevices);
          if (videoInputDevices.length > 0) {
            // Prefer back camera for barcode scanning
            const backCamera = videoInputDevices.find(device => 
              device.label.toLowerCase().includes('back') || 
              device.label.toLowerCase().includes('rear')
            );
            setSelectedDeviceId(backCamera?.deviceId || videoInputDevices[0].deviceId);
          }
        })
        .catch((err) => {
          console.error("Error getting video devices:", err);
          onError("Failed to get camera devices");
        });
    }
  }, [codeReader, onError]);

  // Start scanning
  const startScanning = useCallback(async () => {
    if (!codeReader || !videoRef.current || isActive) return;

    try {
      // Request camera permission
      await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
      setIsActive(true);

      // Start decoding from the video element
      codeReader.decodeFromVideoDevice(
        selectedDeviceId || undefined,
        videoRef.current,
        (result, error) => {
          if (result) {
            const now = Date.now();
            // Prevent duplicate scans within 2 seconds
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
    } catch (error) {
      console.error("Error starting barcode scanner:", error);
      setHasPermission(false);
      onError("Failed to start camera");
    }
  }, [codeReader, selectedDeviceId, isActive, lastScanTime, onScan, onError]);

  // Stop scanning
  const stopScanning = useCallback(() => {
    if (codeReader && isActive) {
      codeReader.reset();
      setIsActive(false);
    }
  }, [codeReader, isActive]);

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
      </div>

      {/* Camera selection */}
      {devices.length > 1 && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">
            Select Camera:
          </label>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={isActive}
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.substring(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
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
