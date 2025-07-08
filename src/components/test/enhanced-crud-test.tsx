"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { MagicCard } from "~/components/ui/magic-card";
import { EnhancedTicketTypeList } from "~/components/ticket/enhanced-ticket-type-list";
import { EnhancedWristbandList } from "~/components/wristband/enhanced-wristband-list";
import { TicketTypeEditModal } from "~/components/ticket/ticket-type-edit-modal";
import { WristbandEditModal } from "~/components/wristband/wristband-edit-modal";
import { useEnhancedTicketTypes, useEnhancedWristbands } from "~/lib/api/hooks/enhanced-crud";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface EnhancedCrudTestProps {
  organizerId: string;
}

export function EnhancedCrudTest({ organizerId }: EnhancedCrudTestProps) {
  
  // State for modals
  const [isTicketEditModalOpen, setIsTicketEditModalOpen] = useState(false);
  const [isWristbandEditModalOpen, setIsWristbandEditModalOpen] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState<any>(null);
  const [selectedWristband, setSelectedWristband] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Enhanced hooks
  const { 
    deleteTicketType, 
    bulkOperationTicketTypes, 
    exportTicketTypes 
  } = useEnhancedTicketTypes(organizerId);

  const { 
    updateWristband, 
    deleteWristband, 
    bulkOperationWristbands, 
    exportWristbands 
  } = useEnhancedWristbands(organizerId);

  // Ticket type handlers
  const handleEditTicketType = (ticketType: any) => {
    setSelectedTicketType(ticketType);
    setIsTicketEditModalOpen(true);
  };

  const handleTicketTypeEditSuccess = (updatedTicketType: any) => {
    setIsTicketEditModalOpen(false);
    setSelectedTicketType(null);
    setRefreshTrigger(prev => prev + 1);
    toast.success("Ticket type updated successfully");
  };

  const handleDeleteTicketType = async (ticketTypeId: string, reason?: string) => {
    try {
      await deleteTicketType(ticketTypeId, reason);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error deleting ticket type:", error);
    }
  };

  const handleBulkTicketTypeOperation = async (ticketTypeIds: string[], operation: string, reason?: string) => {
    try {
      await bulkOperationTicketTypes(ticketTypeIds, operation, reason);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error performing bulk operation:", error);
    }
  };

  const handleExportTicketTypes = (ticketTypes: any[]) => {
    exportTicketTypes(ticketTypes);
  };

  // Wristband handlers
  const handleEditWristband = (wristband: any) => {
    setSelectedWristband(wristband);
    setIsWristbandEditModalOpen(true);
  };

  const handleWristbandEditSuccess = (updatedWristband: any) => {
    setIsWristbandEditModalOpen(false);
    setSelectedWristband(null);
    setRefreshTrigger(prev => prev + 1);
    toast.success("Wristband updated successfully");
  };

  const handleDeleteWristband = async (wristbandId: string, reason?: string) => {
    try {
      await deleteWristband(wristbandId, reason);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error deleting wristband:", error);
    }
  };

  const handleBulkWristbandOperation = async (wristbandIds: string[], operation: string, reason?: string) => {
    try {
      await bulkOperationWristbands(wristbandIds, operation, reason);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error performing bulk operation:", error);
    }
  };

  const handleExportWristbands = (wristbands: any[]) => {
    exportWristbands(wristbands);
  };

  // Placeholder handlers for wristband-specific actions
  const handleViewScans = (wristband: any) => {
    toast.info(`Viewing scans for ${wristband.name}`);
  };

  const handleViewQR = (wristband: any) => {
    toast.info(`Viewing QR code for ${wristband.name}`);
  };

  const handleGenerateBarcode = (wristband: any) => {
    toast.info(`Generating barcode for ${wristband.name}`);
  };

  return (
    <div className="space-y-6">
      <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Enhanced CRUD Test</h2>
          <p className="text-muted-foreground mb-4">
            Test the enhanced ticket type and wristband management components with full CRUD functionality.
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setRefreshTrigger(prev => prev + 1)}
            >
              Refresh All
            </Button>
          </div>
        </div>
      </MagicCard>

      <Tabs defaultValue="tickets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tickets">Ticket Types</TabsTrigger>
          <TabsTrigger value="wristbands">Wristbands</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-6">
          <EnhancedTicketTypeList
            organizerId={organizerId}
            onEdit={handleEditTicketType}
            onDelete={handleDeleteTicketType}
            onBulkOperation={handleBulkTicketTypeOperation}
            onExport={handleExportTicketTypes}
            refreshTrigger={refreshTrigger}
          />
        </TabsContent>

        <TabsContent value="wristbands" className="space-y-6">
          <EnhancedWristbandList
            organizerId={organizerId}
            onEdit={handleEditWristband}
            onDelete={handleDeleteWristband}
            onBulkOperation={handleBulkWristbandOperation}
            onExport={handleExportWristbands}
            onViewScans={handleViewScans}
            onViewQR={handleViewQR}
            onGenerateBarcode={handleGenerateBarcode}
            refreshTrigger={refreshTrigger}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Modals */}
      <TicketTypeEditModal
        open={isTicketEditModalOpen}
        onOpenChange={setIsTicketEditModalOpen}
        ticketType={selectedTicketType}
        organizerId={organizerId}
        onSuccess={handleTicketTypeEditSuccess}
      />

      <WristbandEditModal
        open={isWristbandEditModalOpen}
        onOpenChange={setIsWristbandEditModalOpen}
        wristband={selectedWristband}
        organizerId={organizerId}
        onSuccess={handleWristbandEditSuccess}
      />
    </div>
  );
}
