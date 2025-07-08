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
  const [currentCameraInfo, setCurrentCameraInfo] = useState<{
    deviceId?: string;
    facingMode?: string;
    width?: number;
    height?: number;
    label?: string;
  } | null>(null);

  // Initialize code reader
  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    setCodeReader(reader);

    return () => {
      reader.reset();
    };
  }, []);



  // Get available video devices
  const getDevices = useCallback(async () => {
    try {
      console.log("🔍 Getting camera devices...");

      // Request permission first to get device labels
      await navigator.mediaDevices.getUserMedia({ video: true });

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');

      console.log("📱 Available cameras:", videoDevices.map(d => ({
        id: d.deviceId.substring(0, 8),
        label: d.label
      })));

      setDevices(videoDevices);

      if (videoDevices.length > 0 && !selectedDeviceId) {
        // Prefer back camera if available
        const backCamera = videoDevices.find(device =>
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment') ||
          device.label.toLowerCase().includes('facing back')
        );

        const selectedCamera = backCamera || videoDevices[0];
        console.log("📷 Selected camera:", {
          id: selectedCamera.deviceId.substring(0, 8),
          label: selectedCamera.label,
          isBackCamera: !!backCamera
        });

        setSelectedDeviceId(selectedCamera.deviceId);
      }
    } catch (error) {
      console.error("❌ Error getting video devices:", error);
      onError("Failed to access camera devices. Please ensure camera permissions are granted.");
    }
  }, [selectedDeviceId, onError]);

  // Start scanning
  const startScanning = useCallback(async () => {
    if (!codeReader || !videoRef.current) return;

    try {
      setIsActive(true);
      setHasPermission(null);

      // First get devices to ensure we have camera access
      await getDevices();

      // Request camera permission and start streaming
      let constraints: MediaStreamConstraints;

      if (selectedDeviceId) {
        constraints = {
          video: {
            deviceId: { exact: selectedDeviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        console.log("🎯 Using specific camera:", selectedDeviceId.substring(0, 8));
      } else {
        // Fallback constraints - try back camera first, then any camera
        constraints = {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        console.log("🔄 Using facingMode: environment (rear camera)");
      }

      let stream: MediaStream;

      try {
        console.log("📡 Requesting camera with constraints:", constraints);
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("✅ Camera stream obtained successfully");
      } catch (constraintError) {
        console.warn("⚠️ Failed with specific constraints:", constraintError);
        console.log("🔄 Trying fallback constraints...");

        // Try with facingMode environment first
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' }
            }
          });
          console.log("✅ Fallback with environment facingMode successful");
        } catch (envError) {
          console.warn("⚠️ Environment facingMode failed:", envError);
          // Final fallback to basic video constraints
          stream = await navigator.mediaDevices.getUserMedia({
            video: true
          });
          console.log("✅ Basic video constraints successful");
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // Debug: Log camera track settings
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const settings = videoTrack.getSettings();
          const cameraInfo = {
            deviceId: settings.deviceId?.substring(0, 8),
            facingMode: settings.facingMode,
            width: settings.width,
            height: settings.height,
            label: videoTrack.label
          };

          console.log("📹 Active camera settings:", cameraInfo);
          setCurrentCameraInfo(cameraInfo);
        }
      }

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

      setHasPermission(true);
    } catch (error) {
      console.error("Error starting barcode scanner:", error);
      setHasPermission(false);
      setIsActive(false);

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          onError("Camera access denied. Please allow camera permissions and try again.");
        } else if (error.name === 'NotFoundError') {
          onError("No camera found. Please ensure your device has a camera.");
        } else if (error.name === 'NotReadableError') {
          onError("Camera is already in use by another application.");
        } else {
          onError(`Camera error: ${error.message}`);
        }
      } else {
        onError("Failed to start camera");
      }
    }
  }, [codeReader, selectedDeviceId, lastScanTime, onScan, onError, getDevices]);

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

  // Force rear camera
  const forceRearCamera = useCallback(async () => {
    const wasActive = isActive;
    if (wasActive) {
      stopScanning();
    }

    // Clear selected device to force facingMode constraint
    setSelectedDeviceId("");

    if (wasActive) {
      setTimeout(() => {
        startScanning();
      }, 500);
    }
  }, [isActive, stopScanning, startScanning]);

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

      {/* Camera information */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isActive ? (
              <Camera className="h-4 w-4 text-green-500" />
            ) : (
              <CameraOff className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-sm text-gray-600">
              {devices.length > 0 ? (
                devices.find(d => d.deviceId === selectedDeviceId)?.label ||
                `Camera ${selectedDeviceId.substring(0, 8)}`
              ) : (
                "No camera detected"
              )}
            </span>
          </div>

          <div className="flex gap-1">
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

            <Button
              variant="outline"
              size="sm"
              onClick={forceRearCamera}
              disabled={!hasPermission}
              className="text-xs"
              title="Force rear camera using facingMode"
            >
              📷 Rear
            </Button>
          </div>
        </div>

        {/* Real-time camera info */}
        {currentCameraInfo && isActive && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <div className="grid grid-cols-2 gap-1">
              <span>Facing: {currentCameraInfo.facingMode || 'unknown'}</span>
              <span>Resolution: {currentCameraInfo.width}x{currentCameraInfo.height}</span>
              <span>Device: {currentCameraInfo.deviceId}</span>
              <span>Scans: {scanCount}</span>
            </div>
          </div>
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
