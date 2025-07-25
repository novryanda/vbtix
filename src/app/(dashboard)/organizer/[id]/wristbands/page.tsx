"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { OrganizerRoute } from "~/components/auth/organizer-route";
import { MagicCard } from "~/components/ui/magic-card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { WristbandCreateForm } from "~/components/wristband/wristband-create-form";
import { WristbandList } from "~/components/wristband/wristband-list";
import { EnhancedWristbandList } from "~/components/wristband/enhanced-wristband-list";
import { WristbandEditModal } from "~/components/wristband/wristband-edit-modal";
import { WristbandQRModal } from "~/components/wristband/wristband-qr-modal";
import { WristbandQRScanner } from "~/components/wristband/wristband-qr-scanner";
import { WristbandBarcodeScanner } from "~/components/wristband/wristband-barcode-scanner";
import { CameraDebug } from "~/components/debug/camera-debug";
import { useOrganizerEvents } from "~/lib/api/hooks/organizer";
import { useWristbandScanLogs } from "~/lib/api/hooks/qr-code";
import { useEnhancedWristbands } from "~/lib/api/hooks/enhanced-crud";
import { exportWristbandsToCSV } from "~/lib/utils/csv-export";
import {
  ShieldIcon,
  PlusIcon,
  ScanIcon,
  ListIcon,
  BarChart3Icon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function WristbandsPage() {
  const params = useParams();
  const organizerId = params.id as string;
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedWristband, setSelectedWristband] = useState<any>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedWristbandForScans, setSelectedWristbandForScans] = useState<string>("");
  const [activeTab, setActiveTab] = useState("list");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWristbandForEdit, setSelectedWristbandForEdit] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch organizer events for the create form
  const { data: eventsData, isLoading: isEventsLoading, error: eventsError } = useOrganizerEvents(organizerId);
  const events = eventsData?.data || [];

  // Enhanced wristband management hooks
  const {
    updateWristband,
    deleteWristband,
    bulkOperationWristbands,
    exportWristbands
  } = useEnhancedWristbands(organizerId);

  const handleCreateSuccess = (wristband: any) => {
    setIsCreateDialogOpen(false);
    // The list will refresh automatically due to SWR
  };

  const handleViewQR = (wristband: any) => {
    setSelectedWristband(wristband);
    setIsQRModalOpen(true);
  };

  const handleViewScans = (wristbandId: string) => {
    setSelectedWristbandForScans(wristbandId);
    setActiveTab("scans");
  };

  const handleGenerateBarcode = async (wristband: any) => {
    try {
      const wristbandId = typeof wristband === 'string' ? wristband : wristband.id;
      const response = await fetch(`/api/organizer/${organizerId}/wristbands/${wristbandId}/barcode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Barcode generated successfully!");
        // Trigger refresh by updating refresh trigger
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(result.error || "Failed to generate barcode");
      }
    } catch (error) {
      console.error("Error generating barcode:", error);
      toast.error("Failed to generate barcode");
    }
  };

  const handleScanSuccess = (result: any) => {
    toast.success(`Wristband "${result.wristband?.name}" scanned successfully!`);
  };

  const handleScanError = (error: string) => {
    console.error("Wristband scan error:", error);
    toast.error(error);
  };

  // Enhanced wristband handlers
  const handleEditWristband = (wristband: any) => {
    setSelectedWristbandForEdit(wristband);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = (updatedWristband: any) => {
    setIsEditModalOpen(false);
    setSelectedWristbandForEdit(null);
    // The list will refresh automatically
  };

  const handleDeleteWristband = async (wristbandId: string, reason?: string) => {
    try {
      await deleteWristband(wristbandId, reason);
      // The list will refresh automatically
    } catch (error) {
      console.error("Error deleting wristband:", error);
    }
  };

  const handleBulkOperation = async (wristbandIds: string[], operation: string, reason?: string) => {
    try {
      await bulkOperationWristbands(wristbandIds, operation, reason);
      // The list will refresh automatically
    } catch (error) {
      console.error("Error performing bulk operation:", error);
    }
  };

  const handleExportWristbands = (wristbands: any[]) => {
    exportWristbands(wristbands);
  };

  if (isEventsLoading) {
    return (
      <OrganizerRoute>
        <div className="container mx-auto p-6">
          <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading wristband management...</p>
            </div>
          </MagicCard>
        </div>
      </OrganizerRoute>
    );
  }

  if (eventsError) {
    return (
      <OrganizerRoute>
        <div className="container mx-auto p-6">
          <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
            <div className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
              <p className="text-muted-foreground">{eventsError}</p>
            </div>
          </MagicCard>
        </div>
      </OrganizerRoute>
    );
  }

  return (
    <OrganizerRoute>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShieldIcon className="h-8 w-8 text-primary" />
              Wristband Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Create and manage wristband QR codes for your events
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Wristband
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Wristband</DialogTitle>
                <DialogDescription>
                  Create a new wristband QR code for your event attendees
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[calc(90vh-8rem)] overflow-y-auto">
                <WristbandCreateForm
                  organizerId={organizerId}
                  events={events}
                  isEventsLoading={isEventsLoading}
                  onSuccess={handleCreateSuccess}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <ListIcon className="h-4 w-4" />
              Wristbands
            </TabsTrigger>
            <TabsTrigger value="scanner" className="flex items-center gap-2">
              <ScanIcon className="h-4 w-4" />
              Scanner
            </TabsTrigger>
            <TabsTrigger value="scans" className="flex items-center gap-2">
              <BarChart3Icon className="h-4 w-4" />
              Scan Logs
            </TabsTrigger>
            <TabsTrigger value="debug" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Debug
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Wristband List */}
          <TabsContent value="list" className="space-y-6">
            <EnhancedWristbandList
              organizerId={organizerId}
              onEdit={handleEditWristband}
              onDelete={handleDeleteWristband}
              onBulkOperation={handleBulkOperation}
              onExport={handleExportWristbands}
              onViewScans={handleViewScans}
              onViewQR={handleViewQR}
              onGenerateBarcode={handleGenerateBarcode}
              refreshTrigger={refreshTrigger}
            />
          </TabsContent>

          {/* Barcode Scanner */}
          <TabsContent value="scanner" className="space-y-6">
            <WristbandBarcodeScanner
              organizerId={organizerId}
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
            />
          </TabsContent>

          {/* Scan Logs */}
          <TabsContent value="scans" className="space-y-6">
            <ScanLogsView
              organizerId={organizerId}
              wristbandId={selectedWristbandForScans}
            />
          </TabsContent>

          {/* Camera Debug */}
          <TabsContent value="debug" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">Camera Troubleshooting</h2>
                <p className="text-muted-foreground">
                  Use this debug panel to diagnose camera access issues and test different camera configurations.
                </p>
              </div>
              <CameraDebug />
            </div>
          </TabsContent>
        </Tabs>

        {/* QR Code Modal */}
        <WristbandQRModal
          wristband={selectedWristband}
          isOpen={isQRModalOpen}
          onClose={() => {
            setIsQRModalOpen(false);
            setSelectedWristband(null);
          }}
        />

        {/* Edit Wristband Modal */}
        <WristbandEditModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          wristband={selectedWristbandForEdit}
          organizerId={organizerId}
          onSuccess={handleEditSuccess}
        />
      </div>
    </OrganizerRoute>
  );
}

// Scan Logs View Component
function ScanLogsView({ organizerId, wristbandId }: { organizerId: string; wristbandId: string }) {
  const { wristband, scanLogs, pagination, isLoading, error } = useWristbandScanLogs(
    organizerId,
    wristbandId,
    { page: 1, limit: 20 }
  );

  if (!wristbandId) {
    return (
      <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
        <div className="p-8 text-center">
          <BarChart3Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Select a Wristband</h3>
          <p className="text-muted-foreground">
            Choose a wristband from the list to view its scan logs
          </p>
        </div>
      </MagicCard>
    );
  }

  if (isLoading) {
    return (
      <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
        <div className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading scan logs...</p>
        </div>
      </MagicCard>
    );
  }

  if (error) {
    return (
      <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
        <div className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Scan Logs</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </MagicCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wristband Info */}
      {wristband && (
        <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">{wristband.name}</h3>
            <p className="text-muted-foreground mb-4">{wristband.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Event:</span>
                <p className="font-medium">{wristband.event.title}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Scans:</span>
                <p className="font-medium">{wristband.scanCount}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Max Scans:</span>
                <p className="font-medium">{wristband.maxScans || "Unlimited"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Log Entries:</span>
                <p className="font-medium">{scanLogs.length}</p>
              </div>
            </div>
          </div>
        </MagicCard>
      )}

      {/* Scan Logs */}
      <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
        <div className="p-6">
          <h4 className="font-semibold mb-4">Scan History</h4>
          {scanLogs.length === 0 ? (
            <div className="text-center py-8">
              <ScanIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No scans recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scanLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{log.scanResult}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(log.scannedAt).toLocaleString()}
                    </p>
                    {log.scanLocation && (
                      <p className="text-xs text-muted-foreground">
                        Location: {log.scanLocation}
                      </p>
                    )}
                  </div>
                  {log.notes && (
                    <p className="text-sm text-muted-foreground max-w-xs">
                      {log.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </MagicCard>
    </div>
  );
}
