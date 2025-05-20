"use client";

import useSWR from "swr";
import { ORGANIZER_ENDPOINTS } from "../endpoints";
import { fetcher } from "../client"; // Import fetcher from client
import type { Event, PaginatedResponse, TicketType } from "~/lib/types";

// Hook to fetch organizer dashboard data
export const useOrganizerDashboard = (organizerId: string) => {
  // Define a type for dashboard data
  type DashboardData = {
    stats: {
      totalEvents: number;
      totalTicketsSold: number;
      totalRevenue: number;
      upcomingEventsCount: number;
    };
    upcomingEvents: Event[];
    recentTransactions?: any[];
    eventPerformance?: any[];
  };

  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: DashboardData;
    error?: string;
  }>(organizerId ? ORGANIZER_ENDPOINTS.DASHBOARD(organizerId) : null, fetcher);
  return { data, error, isLoading, mutate };
};

// Hook to fetch all organizer events
export const useOrganizerEvents = (
  organizerId: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  },
) => {
  // Build query string
  let url = organizerId ? ORGANIZER_ENDPOINTS.EVENTS(organizerId) : null;
  if (url && params) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.status) queryParams.append("status", params.status);
    if (params.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
  }

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Event>>(
    url,
    fetcher,
  );
  return { data, error, isLoading, mutate };
};

// Hook to fetch a specific organizer event by ID
export const useOrganizerEventDetail = (organizerId: string, id: string) => {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: Event;
    error?: string;
  }>(
    organizerId && id
      ? ORGANIZER_ENDPOINTS.EVENT_DETAIL(organizerId, id)
      : null,
    fetcher,
  );
  return { data, error, isLoading, mutate };
};

// Hook to create a new event
export const useCreateEvent = (organizerId: string) => {
  // We don't need to fetch data for this hook, it's just for creating events
  // The actual creation will be done with a POST request to ORGANIZER_ENDPOINTS.EVENTS
  return {
    createEvent: async (eventData: any) => {
      const url = organizerId
        ? ORGANIZER_ENDPOINTS.CREATE_EVENT(organizerId)
        : null;

      if (!url) {
        throw new Error("Organizer ID is required");
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create event");
      }

      return await response.json();
    },
  };
};

// Hook to update an event by ID
export const useUpdateEvent = (organizerId: string, id: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    organizerId && id
      ? ORGANIZER_ENDPOINTS.UPDATE_EVENT(organizerId, id)
      : null,
    fetcher,
  );
  return { data, error, isLoading, mutate };
};

// Hook to delete an event by ID
export const useDeleteEvent = (organizerId: string, id: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    organizerId && id
      ? ORGANIZER_ENDPOINTS.DELETE_EVENT(organizerId, id)
      : null,
    fetcher,
  );
  return { data, error, isLoading, mutate };
};

// Hook to fetch tickets for a specific event
export const useEventTickets = (
  organizerId: string,
  eventId: string,
  params?: {
    page?: number;
    limit?: number;
  },
) => {
  // Build query string
  let url =
    organizerId && eventId
      ? ORGANIZER_ENDPOINTS.EVENT_TICKETS(organizerId, eventId)
      : null;

  if (url && params) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
  }

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<TicketType>
  >(url, fetcher);
  return { data, error, isLoading, mutate };
};

// Hook to fetch a specific ticket type for an event
export const useEventTicketDetail = (
  organizerId: string,
  eventId: string,
  ticketId: string,
) => {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: TicketType;
    error?: string;
  }>(
    organizerId && eventId && ticketId
      ? ORGANIZER_ENDPOINTS.EVENT_TICKET_DETAIL(organizerId, eventId, ticketId)
      : null,
    fetcher,
  );
  return { data, error, isLoading, mutate };
};

// Hook to fetch sales data for a specific event
export const useEventSales = (
  organizerId: string,
  params?: {
    eventId?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: "day" | "week" | "month";
  },
) => {
  // Build query string
  let url = organizerId ? ORGANIZER_ENDPOINTS.SALES(organizerId) : null;
  if (url && params) {
    const queryParams = new URLSearchParams();
    if (params.eventId) queryParams.append("eventId", params.eventId);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.groupBy) queryParams.append("groupBy", params.groupBy);

    const queryString = queryParams.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
  }

  // Define a type for sales data item
  type SalesDataItem = {
    date: string;
    count: number;
    ticketsSold: number;
    revenue: number;
  };

  // Define a type for the complete sales response
  type SalesResponse = {
    salesData: SalesDataItem[];
    totalRevenue: number;
    totalTicketsSold: number;
    totalSales: number;
  };

  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: SalesResponse;
    error?: string;
  }>(url, fetcher);
  return { data, error, isLoading, mutate };
};

// Hook to fetch organizer settings and verification status
export const useOrganizerSettings = (organizerId: string) => {
  // Define a type for organizer settings
  type OrganizerSettings = {
    id: string;
    userId: string;
    orgName: string;
    legalName?: string;
    npwp?: string;
    bankAccount?: {
      bankName: string;
      accountName: string;
      accountNumber: string;
      branch?: string;
    };
    socialMedia?: Record<string, string>;
    verificationDocs?: string;
    verified: boolean;
    createdAt: string;
    updatedAt: string;
  };

  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: OrganizerSettings;
    error?: string;
  }>(organizerId ? ORGANIZER_ENDPOINTS.SETTINGS(organizerId) : null, fetcher);

  return {
    settings: data?.data,
    error,
    isLoading,
    mutate,
  };
};

// Hook to fetch organizer verification status
export const useOrganizerVerification = (organizerId: string) => {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: {
      id: string;
      verificationDocs?: string;
      verified: boolean;
      approval?: {
        status: string;
        notes?: string;
        submittedAt?: string;
        reviewedAt?: string;
      };
    };
    error?: string;
  }>(
    organizerId ? ORGANIZER_ENDPOINTS.VERIFICATION(organizerId) : null,
    fetcher,
  );

  return {
    verification: data?.data,
    error,
    isLoading,
    mutate,
  };
};
