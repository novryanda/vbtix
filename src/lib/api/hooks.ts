/**
 * React Query hooks for API requests
 */

import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { apiRequest } from "./client";
import { ADMIN_ENDPOINTS, EVENT_ENDPOINTS } from "./endpoints";
import { ApiResponse, EventWithTickets } from "~/lib/types";

// Admin Dashboard Hooks

/**
 * Hook to fetch admin dashboard data
 */
export function useAdminDashboard() {
  return useQuery({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      const response = await apiRequest<{
        totalUsers: number;
        totalEvents: number;
        totalOrders: number;
        pendingApprovals: number;
      }>(ADMIN_ENDPOINTS.DASHBOARD);

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch dashboard data");
      }

      return response.data;
    },
  });
}

/**
 * Hook to fetch admin events list
 */
export function useAdminEvents(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["adminEvents", params],
    queryFn: async () => {
      const response = await apiRequest<{
        events: EventWithTickets[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>(ADMIN_ENDPOINTS.EVENTS, {
        params: {
          page: params?.page,
          limit: params?.limit,
          status: params?.status,
          search: params?.search,
        },
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch events");
      }

      return response.data;
    },
  });
}

/**
 * Hook to fetch admin event details
 */
export function useAdminEventDetail(id: string) {
  return useQuery({
    queryKey: ["adminEvent", id],
    queryFn: async () => {
      const response = await apiRequest<EventWithTickets>(
        ADMIN_ENDPOINTS.EVENT_DETAIL(id)
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch event details");
      }

      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to fetch admin event statistics
 */
export function useAdminEventStatistics(id: string) {
  return useQuery({
    queryKey: ["adminEventStatistics", id],
    queryFn: async () => {
      const response = await apiRequest<{
        totalTickets: number;
        soldTickets: number;
        revenue: number;
        viewCount: number;
      }>(ADMIN_ENDPOINTS.EVENT_STATISTICS(id));

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch event statistics");
      }

      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to fetch admin users list
 */
export function useAdminUsers(params?: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["adminUsers", params],
    queryFn: async () => {
      const response = await apiRequest<{
        users: Array<{
          id: string;
          name: string;
          email: string;
          role: string;
          createdAt: string;
        }>;
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>(ADMIN_ENDPOINTS.USERS, {
        params: {
          page: params?.page,
          limit: params?.limit,
          role: params?.role,
          search: params?.search,
        },
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch users");
      }

      return response.data;
    },
  });
}

/**
 * Hook to set an event as featured
 */
export function useSetEventFeatured() {
  return useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const response = await apiRequest<EventWithTickets>(
        ADMIN_ENDPOINTS.EVENT_FEATURED(id),
        {
          method: "POST",
          body: { featured },
        }
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to update event featured status");
      }

      return response.data;
    },
  });
}

/**
 * Hook to approve or reject an event
 */
export function useReviewEvent() {
  return useMutation({
    mutationFn: async ({
      id,
      status,
      feedback,
    }: {
      id: string;
      status: "approved" | "rejected";
      feedback?: string;
    }) => {
      const response = await apiRequest<EventWithTickets>(
        ADMIN_ENDPOINTS.EVENT_REVIEW,
        {
          method: "POST",
          body: { id, status, feedback },
        }
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to review event");
      }

      return response.data;
    },
  });
}
