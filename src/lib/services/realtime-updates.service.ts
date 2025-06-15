"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Real-time update service for buyer order status
 * Uses polling mechanism to check for order status updates
 */

export interface OrderStatusUpdate {
  orderId: string;
  status: string;
  paymentStatus?: string;
  hasQRCodes?: boolean;
  lastUpdated: string;
}

export interface UseOrderStatusOptions {
  orderId: string;
  initialStatus?: string;
  pollingInterval?: number; // in milliseconds
  enabled?: boolean;
}

/**
 * Hook for real-time order status updates
 */
export function useOrderStatus({
  orderId,
  initialStatus,
  pollingInterval = 5000, // 5 seconds default
  enabled = true,
}: UseOrderStatusOptions) {
  const [status, setStatus] = useState(initialStatus || "PENDING");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const checkOrderStatus = async () => {
    if (!enabled || !orderId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get session ID from localStorage for guest access
      const sessionId = localStorage.getItem("vbticket_session_id");

      // Build URL with session ID for guest access
      const url = sessionId
        ? `/api/public/orders/${orderId}/status?sessionId=${sessionId}`
        : `/api/public/orders/${orderId}/status`;

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch order status");
      }

      if (mountedRef.current && result.success) {
        const newStatus = result.data.status;
        
        // Only update if status actually changed
        if (newStatus !== status) {
          setStatus(newStatus);
          setLastUpdated(new Date());
          
          // Trigger custom event for other components to listen
          window.dispatchEvent(
            new CustomEvent("orderStatusUpdate", {
              detail: {
                orderId,
                status: newStatus,
                paymentStatus: result.data.paymentStatus,
                hasQRCodes: result.data.hasQRCodes,
                lastUpdated: new Date().toISOString(),
              } as OrderStatusUpdate,
            })
          );
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Start polling
  useEffect(() => {
    if (!enabled || !orderId) return;

    // Initial check
    checkOrderStatus();

    // Set up polling
    intervalRef.current = setInterval(checkOrderStatus, pollingInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [orderId, enabled, pollingInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Manual refresh function
  const refresh = () => {
    checkOrderStatus();
  };

  // Stop polling function
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Resume polling function
  const resumePolling = () => {
    if (!intervalRef.current && enabled) {
      intervalRef.current = setInterval(checkOrderStatus, pollingInterval);
    }
  };

  return {
    status,
    isLoading,
    error,
    lastUpdated,
    refresh,
    stopPolling,
    resumePolling,
  };
}

/**
 * Hook to listen for order status updates from other components
 */
export function useOrderStatusListener(orderId: string) {
  const [updates, setUpdates] = useState<OrderStatusUpdate[]>([]);

  useEffect(() => {
    const handleOrderUpdate = (event: CustomEvent<OrderStatusUpdate>) => {
      if (event.detail.orderId === orderId) {
        setUpdates((prev) => [...prev, event.detail]);
      }
    };

    window.addEventListener("orderStatusUpdate", handleOrderUpdate as EventListener);

    return () => {
      window.removeEventListener("orderStatusUpdate", handleOrderUpdate as EventListener);
    };
  }, [orderId]);

  return updates;
}

/**
 * Utility function to determine if an order status indicates completion
 */
export function isOrderCompleted(status: string): boolean {
  return ["SUCCESS", "PAID", "COMPLETED"].includes(status.toUpperCase());
}

/**
 * Utility function to determine if an order status indicates failure
 */
export function isOrderFailed(status: string): boolean {
  return ["FAILED", "CANCELLED", "EXPIRED"].includes(status.toUpperCase());
}

/**
 * Utility function to determine if an order is still pending
 */
export function isOrderPending(status: string): boolean {
  return ["PENDING", "PROCESSING", "AWAITING_PAYMENT"].includes(status.toUpperCase());
}

/**
 * Get user-friendly status message
 */
export function getStatusMessage(status: string): string {
  switch (status.toUpperCase()) {
    case "SUCCESS":
    case "PAID":
    case "COMPLETED":
      return "Pembayaran berhasil! Tiket Anda sudah siap.";
    case "PENDING":
      return "Menunggu pembayaran...";
    case "PROCESSING":
      return "Sedang memproses pembayaran...";
    case "AWAITING_PAYMENT":
      return "Menunggu konfirmasi pembayaran...";
    case "FAILED":
      return "Pembayaran gagal. Silakan coba lagi.";
    case "CANCELLED":
      return "Pesanan dibatalkan.";
    case "EXPIRED":
      return "Pesanan telah kadaluarsa.";
    default:
      return `Status: ${status}`;
  }
}

/**
 * Get status color for UI display
 */
export function getStatusColor(status: string): string {
  if (isOrderCompleted(status)) return "text-green-600 bg-green-100";
  if (isOrderFailed(status)) return "text-red-600 bg-red-100";
  if (isOrderPending(status)) return "text-yellow-600 bg-yellow-100";
  return "text-gray-600 bg-gray-100";
}

/**
 * Hook for monitoring multiple orders with real-time updates
 */
export function useOrdersMonitor({
  orderIds,
  enabled = true,
  pollingInterval = 30000, // 30 seconds default for multiple orders
}: {
  orderIds: string[];
  enabled?: boolean;
  pollingInterval?: number;
}) {
  const [orderStatuses, setOrderStatuses] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const checkOrdersStatus = async () => {
    if (!enabled || orderIds.length === 0) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get session ID from localStorage for guest access
      const sessionId = localStorage.getItem("vbticket_session_id");

      // Check each order status
      const statusPromises = orderIds.map(async (orderId) => {
        try {
          // Build URL with session ID for guest access
          const url = sessionId
            ? `/api/public/orders/${orderId}/status?sessionId=${sessionId}`
            : `/api/public/orders/${orderId}/status`;

          const response = await fetch(url);
          const result = await response.json();

          if (result.success) {
            return { orderId, status: result.data.status };
          }
          return { orderId, status: null };
        } catch (err) {
          console.error(`Error checking status for order ${orderId}:`, err);
          return { orderId, status: null };
        }
      });

      const results = await Promise.all(statusPromises);

      if (mountedRef.current) {
        const newStatuses: Record<string, string> = {};
        let hasChanges = false;

        results.forEach(({ orderId, status }) => {
          if (status) {
            newStatuses[orderId] = status;

            // Check if status changed
            if (orderStatuses[orderId] && orderStatuses[orderId] !== status) {
              hasChanges = true;

              // Trigger custom event for status change
              window.dispatchEvent(
                new CustomEvent("orderStatusUpdate", {
                  detail: {
                    orderId,
                    status,
                    lastUpdated: new Date().toISOString(),
                  } as OrderStatusUpdate,
                })
              );
            }
          }
        });

        setOrderStatuses(newStatuses);
        setLastUpdated(new Date());

        // Trigger callback if there are changes
        if (hasChanges) {
          window.dispatchEvent(
            new CustomEvent("ordersStatusChanged", {
              detail: { orderStatuses: newStatuses },
            })
          );
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Start polling
  useEffect(() => {
    if (!enabled || orderIds.length === 0) return;

    // Initial check
    checkOrdersStatus();

    // Set up polling
    intervalRef.current = setInterval(checkOrdersStatus, pollingInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [orderIds, enabled, pollingInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Manual refresh function
  const refresh = () => {
    checkOrdersStatus();
  };

  return {
    orderStatuses,
    isLoading,
    error,
    lastUpdated,
    refresh,
  };
}
