import useSWR from "swr";
import { useCallback } from "react";
import { PUBLIC_ENDPOINTS, ORGANIZER_ENDPOINTS, ADMIN_ENDPOINTS } from "~/lib/api/endpoints";

/**
 * Fetcher function for API calls
 */
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch");
  }
  return response.json();
};

/**
 * Hook to get QR code for a ticket
 */
export function useTicketQRCode(ticketId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    ticketId ? PUBLIC_ENDPOINTS.TICKET_QR_CODE(ticketId) : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    qrCode: data?.data,
    isLoading,
    error: error?.message,
    refresh: mutate,
  };
}

/**
 * Hook to validate QR code (for organizers)
 */
export function useQRCodeValidation(organizerId: string) {
  const validateQRCode = async (qrCodeData: string, checkIn: boolean = false) => {
    try {
      const response = await fetch(ORGANIZER_ENDPOINTS.QR_CODE_VALIDATE(organizerId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrCodeData,
          checkIn,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Validation failed");
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    validateQRCode,
  };
}

/**
 * Hook to generate QR codes for a transaction (admin only)
 */
export function useTransactionQRGeneration() {
  const generateQRCodes = async (transactionId: string) => {
    try {
      const response = await fetch(ADMIN_ENDPOINTS.GENERATE_TRANSACTION_QR(transactionId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "QR generation failed");
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    generateQRCodes,
  };
}

/**
 * Hook for QR code scanner functionality
 */
export function useQRCodeScanner(organizerId: string) {
  const scanAndValidate = async (qrCodeData: string) => {
    try {
      const response = await fetch(ORGANIZER_ENDPOINTS.QR_CODE_VALIDATE(organizerId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrCodeData,
          checkIn: false, // Just validate, don't check in
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Validation failed");
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  const scanAndCheckIn = async (qrCodeData: string) => {
    try {
      const response = await fetch(ORGANIZER_ENDPOINTS.QR_CODE_VALIDATE(organizerId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrCodeData,
          checkIn: true, // Validate and check in
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Check-in failed");
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    scanAndValidate,
    scanAndCheckIn,
  };
}

/**
 * Hook for batch QR code operations
 */
export function useBatchQROperations() {
  const generateBatchQRCodes = async (transactionIds: string[]) => {
    const results = await Promise.allSettled(
      transactionIds.map(async (transactionId) => {
        const response = await fetch(ADMIN_ENDPOINTS.GENERATE_TRANSACTION_QR(transactionId), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "QR generation failed");
        }

        return { transactionId, ...result };
      })
    );

    const successful = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === "fulfilled")
      .map((result) => result.value);

    const failed = results
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map((result) => result.reason.message);

    return {
      successful,
      failed,
      totalProcessed: results.length,
      successCount: successful.length,
      failureCount: failed.length,
    };
  };

  return {
    generateBatchQRCodes,
  };
}

/**
 * Hook for organizer QR code generation
 */
export function useOrganizerQRGeneration() {
  const generateOrderQRCodes = async (organizerId: string, orderId: string) => {
    try {
      const response = await fetch(`/api/organizer/${organizerId}/orders/${orderId}/generate-qr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "QR generation failed");
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    generateOrderQRCodes,
  };
}

/**
 * Hook to get wristbands for an organizer
 */
export function useOrganizerWristbands(
  organizerId: string,
  filters?: {
    eventId?: string;
    page?: number;
    limit?: number;
    search?: string;
  }
) {
  const queryParams = new URLSearchParams();

  if (filters?.eventId) queryParams.append("eventId", filters.eventId);
  if (filters?.page) queryParams.append("page", filters.page.toString());
  if (filters?.limit) queryParams.append("limit", filters.limit.toString());
  if (filters?.search) queryParams.append("search", filters.search);

  const { data, error, isLoading, mutate } = useSWR(
    organizerId ? `/api/organizer/${organizerId}/wristbands?${queryParams.toString()}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // 10 seconds
    }
  );

  return {
    wristbands: data?.data?.wristbands || [],
    pagination: data?.data?.pagination,
    isLoading,
    error: error?.message,
    refresh: mutate,
  };
}

/**
 * Hook to create a new wristband
 */
export function useCreateWristband() {
  const createWristband = async (
    organizerId: string,
    wristbandData: {
      eventId: string;
      name: string;
      description?: string;
      validFrom?: string;
      validUntil?: string;
      maxScans?: number;
    }
  ) => {
    try {
      const response = await fetch(`/api/organizer/${organizerId}/wristbands`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wristbandData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create wristband");
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    createWristband,
  };
}

/**
 * Hook to generate QR code for a wristband
 */
export function useWristbandQRGeneration() {
  const generateWristbandQR = async (organizerId: string, wristbandId: string) => {
    try {
      const response = await fetch(`/api/organizer/${organizerId}/wristbands/${wristbandId}/generate-qr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "QR generation failed");
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    generateWristbandQR,
  };
}

/**
 * Hook to generate barcode for a wristband
 */
export function useWristbandBarcodeGeneration() {
  const generateWristbandBarcode = async (organizerId: string, wristbandId: string) => {
    try {
      const response = await fetch(`/api/organizer/${organizerId}/wristbands/${wristbandId}/barcode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Barcode generation failed");
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    generateWristbandBarcode,
  };
}

/**
 * Hook for wristband QR code validation and scanning
 */
export function useWristbandQRScanner(organizerId: string) {
  const validateWristband = async (qrCodeData: string) => {
    try {
      const response = await fetch(`/api/organizer/${organizerId}/wristbands/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrCodeData,
          scan: false, // Just validate, don't log scan
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Validation failed");
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  const scanWristband = async (
    qrCodeData: string,
    scanLocation?: string,
    scanDevice?: string
  ) => {
    try {
      const response = await fetch(`/api/organizer/${organizerId}/wristbands/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrCodeData,
          scan: true, // Validate and log scan
          scanLocation,
          scanDevice,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Scan failed");
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    validateWristband,
    scanWristband,
  };
}

/**
 * Hook to get scan logs for a wristband
 */
export function useWristbandScanLogs(
  organizerId: string,
  wristbandId: string,
  filters?: {
    page?: number;
    limit?: number;
  }
) {
  const queryParams = new URLSearchParams();

  if (filters?.page) queryParams.append("page", filters.page.toString());
  if (filters?.limit) queryParams.append("limit", filters.limit.toString());

  const { data, error, isLoading, mutate } = useSWR(
    organizerId && wristbandId
      ? `/api/organizer/${organizerId}/wristbands/${wristbandId}/scans?${queryParams.toString()}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // 5 seconds
    }
  );

  return {
    wristband: data?.data?.wristband,
    scanLogs: data?.data?.scanLogs || [],
    pagination: data?.data?.pagination,
    isLoading,
    error: error?.message,
    refresh: mutate,
  };
}

/**
 * Hook for QR code statistics
 */
export function useQRCodeStats(organizerId?: string) {
  const endpoint = organizerId
    ? `${ORGANIZER_ENDPOINTS.SOLD_TICKETS_STATS(organizerId)}?includeQR=true`
    : null;

  const { data, error, isLoading, mutate } = useSWR(
    endpoint,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  return {
    stats: data?.data,
    isLoading,
    error: error?.message,
    refresh: mutate,
  };
}

/**
 * Types for QR code operations
 */
export interface QRCodeValidationResult {
  success: boolean;
  message: string;
  data?: {
    ticket: {
      id: string;
      checkedIn: boolean;
      checkInTime?: string;
      event: {
        title: string;
      };
      ticketType: {
        name: string;
      };
      holder: {
        fullName: string;
        email: string;
      };
    };
  };
}

export interface QRCodeGenerationResult {
  success: boolean;
  message: string;
  data?: {
    transactionId: string;
    generatedCount: number;
    errors: string[];
  };
}

export interface TicketQRCode {
  ticketId: string;
  qrCodeImageUrl: string;
}

/**
 * Hook for wristband barcode scanning operations
 */
export function useWristbandBarcodeScanner() {
  const validateBarcode = useCallback(async (organizerId: string, data: {
    barcodeData?: string;
    codeData?: string;
    codeType?: "QR" | "BARCODE";
    scan?: boolean;
    scanLocation?: string;
    scanDevice?: string;
  }) => {
    const response = await fetcher(`/api/organizer/${organizerId}/wristbands/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        codeData: data.codeData || data.barcodeData,
        codeType: data.codeType || "BARCODE",
      }),
    });

    return response;
  }, []);

  const scanBarcode = useCallback(async (organizerId: string, data: {
    barcodeData?: string;
    codeData?: string;
    codeType?: "QR" | "BARCODE";
    scan: true;
    scanLocation?: string;
    scanDevice?: string;
  }) => {
    const response = await fetcher(`/api/organizer/${organizerId}/wristbands/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        codeData: data.codeData || data.barcodeData,
        codeType: data.codeType || "BARCODE",
      }),
    });

    return response;
  }, []);

  return {
    validateBarcode,
    scanBarcode,
  };
}
