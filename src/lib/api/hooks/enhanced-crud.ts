import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  exportTicketTypesToCSV,
  exportTicketsToCSV,
  exportWristbandsToCSV,
  generateExportFilename
} from "~/lib/utils/csv-export";

/**
 * Hook for enhanced ticket type management
 */
export function useEnhancedTicketTypes(organizerId: string) {
  const [loading, setLoading] = useState(false);

  const deleteTicketType = useCallback(async (ticketTypeId: string, reason?: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/organizer/${organizerId}/tickets/${ticketTypeId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to delete ticket type");
      }

      toast.success("Ticket type deleted successfully");

      return data.data;
    } catch (error: any) {
      toast.error(error.message || "Failed to delete ticket type");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [organizerId, toast]);

  const bulkOperationTicketTypes = useCallback(async (
    ticketTypeIds: string[], 
    operation: string, 
    reason?: string
  ) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/organizer/${organizerId}/tickets/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketTypeIds,
          operation,
          reason,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to perform bulk operation");
      }

      toast.success(`Bulk ${operation} operation completed successfully`);

      return data.data;
    } catch (error: any) {
      toast.error(error.message || "Failed to perform bulk operation");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [organizerId, toast]);

  const exportTicketTypes = useCallback((ticketTypes: any[], context?: { eventName?: string }) => {
    try {
      const filename = generateExportFilename("ticket-types", context);
      exportTicketTypesToCSV(ticketTypes, filename);
      
      toast.success("Ticket types exported successfully");
    } catch (error: any) {
      toast.error("Failed to export ticket types");
    }
  }, []);

  return {
    loading,
    deleteTicketType,
    bulkOperationTicketTypes,
    exportTicketTypes,
  };
}

/**
 * Hook for enhanced wristband management
 */
export function useEnhancedWristbands(organizerId: string) {
  const [loading, setLoading] = useState(false);

  const updateWristband = useCallback(async (wristbandId: string, updateData: any) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/organizer/${organizerId}/wristbands/${wristbandId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to update wristband");
      }

      toast.success("Wristband updated successfully");

      return data.data;
    } catch (error: any) {
      toast.error(error.message || "Failed to update wristband");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [organizerId]);

  const deleteWristband = useCallback(async (wristbandId: string, reason?: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/organizer/${organizerId}/wristbands/${wristbandId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to delete wristband");
      }

      toast.success("Wristband deleted successfully");

      return data.data;
    } catch (error: any) {
      toast.error(error.message || "Failed to delete wristband");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [organizerId]);

  const bulkOperationWristbands = useCallback(async (
    wristbandIds: string[], 
    operation: string, 
    reason?: string
  ) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/organizer/${organizerId}/wristbands/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wristbandIds,
          operation,
          reason,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to perform bulk operation");
      }

      toast.success(`Bulk ${operation} operation completed successfully`);

      return data.data;
    } catch (error: any) {
      toast.error(error.message || "Failed to perform bulk operation");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [organizerId]);

  const exportWristbands = useCallback((wristbands: any[], context?: { eventName?: string }) => {
    try {
      const filename = generateExportFilename("wristbands", context);
      exportWristbandsToCSV(wristbands, filename);
      
      toast.success("Wristbands exported successfully");
    } catch (error: any) {
      toast.error("Failed to export wristbands");
    }
  }, []);

  return {
    loading,
    updateWristband,
    deleteWristband,
    bulkOperationWristbands,
    exportWristbands,
  };
}

/**
 * Hook for enhanced ticket management (individual tickets)
 */
export function useEnhancedTickets(organizerId: string) {
  const [loading, setLoading] = useState(false);

  const exportTickets = useCallback((tickets: any[], context?: { eventName?: string }) => {
    try {
      const filename = generateExportFilename("tickets", context);
      exportTicketsToCSV(tickets, filename);
      
      toast.success("Tickets exported successfully");
    } catch (error: any) {
      toast.error("Failed to export tickets");
    }
  }, []);

  const updateTicketStatus = useCallback(async (ticketId: string, status: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/organizer/${organizerId}/sold-tickets/${ticketId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to update ticket status");
      }

      toast.success("Ticket status updated successfully");

      return data.data;
    } catch (error: any) {
      toast.error(error.message || "Failed to update ticket status");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [organizerId]);

  return {
    loading,
    exportTickets,
    updateTicketStatus,
  };
}
