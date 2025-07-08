"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { MagicCard } from "~/components/ui/magic-card";
import { Badge } from "~/components/ui/badge";
import {
  Camera,
  CameraOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface CameraDebugProps {
  className?: string;
}

export function CameraDebug({ className }: CameraDebugProps) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [permissions, setPermissions] = useState<{
    camera: PermissionState | null;
  }>({ camera: null });
  const [testResults, setTestResults] = useState<{
    basicVideo: boolean | null;
    facingModeEnvironment: boolean | null;
    specificDevice: boolean | null;
  }>({
    basicVideo: null,
    facingModeEnvironment: null,
    specificDevice: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Get device information
  const getDeviceInfo = async () => {
    try {
      setIsLoading(true);
      
      // Check permissions
      if ('permissions' in navigator) {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setPermissions({ camera: cameraPermission.state });
      }

      // Get devices
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);

    } catch (error) {
      console.error("Error getting device info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Test basic video access
  const testBasicVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      setTestResults(prev => ({ ...prev, basicVideo: true }));
      
      // Refresh devices after permission granted
      await getDeviceInfo();
    } catch (error) {
      console.error("Basic video test failed:", error);
      setTestResults(prev => ({ ...prev, basicVideo: false }));
    }
  };

  // Test rear camera with facingMode
  const testFacingModeEnvironment = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });
      
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      
      console.log("FacingMode test settings:", settings);
      
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      
      setTestResults(prev => ({ ...prev, facingModeEnvironment: true }));
    } catch (error) {
      console.error("FacingMode environment test failed:", error);
      setTestResults(prev => ({ ...prev, facingModeEnvironment: false }));
    }
  };

  // Test specific device access
  const testSpecificDevice = async (deviceId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }
      });
      
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      
      console.log("Specific device test settings:", settings);
      
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      
      setTestResults(prev => ({ ...prev, specificDevice: true }));
    } catch (error) {
      console.error("Specific device test failed:", error);
      setTestResults(prev => ({ ...prev, specificDevice: false }));
    }
  };

  useEffect(() => {
    getDeviceInfo();
  }, []);

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    if (status === true) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = (status: boolean | null) => {
    if (status === null) return "Not tested";
    if (status === true) return "Success";
    return "Failed";
  };

  return (
    <div className={className}>
      <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Camera Debug Information</h3>
            <Button
              onClick={getDeviceInfo}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>

          {/* Permission Status */}
          <div>
            <h4 className="font-medium mb-2">Permissions</h4>
            <div className="flex items-center gap-2">
              {permissions.camera === 'granted' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : permissions.camera === 'denied' ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-sm">
                Camera: {permissions.camera || 'unknown'}
              </span>
            </div>
          </div>

          {/* Available Devices */}
          <div>
            <h4 className="font-medium mb-2">Available Cameras ({devices.length})</h4>
            <div className="space-y-2">
              {devices.map((device, index) => (
                <div key={device.deviceId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    <div>
                      <div className="text-sm font-medium">
                        {device.label || `Camera ${index + 1}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {device.deviceId.substring(0, 12)}...
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testSpecificDevice(device.deviceId)}
                    className="text-xs"
                  >
                    Test
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Test Results */}
          <div>
            <h4 className="font-medium mb-2">Camera Access Tests</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.basicVideo)}
                  <span className="text-sm">Basic Video Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={testResults.basicVideo ? "default" : "secondary"}>
                    {getStatusText(testResults.basicVideo)}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={testBasicVideo}
                    className="text-xs"
                  >
                    Test
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.facingModeEnvironment)}
                  <span className="text-sm">Rear Camera (facingMode: environment)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={testResults.facingModeEnvironment ? "default" : "secondary"}>
                    {getStatusText(testResults.facingModeEnvironment)}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={testFacingModeEnvironment}
                    className="text-xs"
                  >
                    Test
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.specificDevice)}
                  <span className="text-sm">Specific Device Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={testResults.specificDevice ? "default" : "secondary"}>
                    {getStatusText(testResults.specificDevice)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Browser Info */}
          <div>
            <h4 className="font-medium mb-2">Browser Information</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>User Agent: {navigator.userAgent}</div>
              <div>HTTPS: {location.protocol === 'https:' ? 'Yes' : 'No'}</div>
              <div>MediaDevices API: {navigator.mediaDevices ? 'Available' : 'Not Available'}</div>
            </div>
          </div>
        </div>
      </MagicCard>
    </div>
  );
}
