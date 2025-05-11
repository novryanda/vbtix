"use client";

import useSWR from "swr";
import { ORGANIZER_ENDPOINTS } from "../endpoints";
import { fetcher } from "../client"; // Import fetcher from client

// Hook to fetch organizer dashboard data
export const useOrganizerDashboard = () => {
  const { data, error, isLoading, mutate } = useSWR(
    ORGANIZER_ENDPOINTS.DASHBOARD,
    fetcher,
  );
  return { data, error, isLoading, mutate };
};

// Hook to fetch all organizer events
export const useOrganizerEvents = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => {
  // Build query string
  let url = ORGANIZER_ENDPOINTS.EVENTS;
  if (params) {
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

  const { data, error, isLoading, mutate } = useSWR(url, fetcher);
  return { data, error, isLoading, mutate };
};

// Hook to fetch a specific organizer event by ID
export const useOrganizerEventDetail = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ORGANIZER_ENDPOINTS.EVENT_DETAIL(id) : null,
    fetcher,
  );
  return { data, error, isLoading, mutate };
};

// Hook to create a new event
export const useCreateEvent = () => {
  const { data, error, isLoading, mutate } = useSWR(
    ORGANIZER_ENDPOINTS.CREATE_EVENT,
    fetcher,
  );
  return { data, error, isLoading, mutate };
};

// Hook to update an event by ID
export const useUpdateEvent = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ORGANIZER_ENDPOINTS.UPDATE_EVENT(id) : null,
    fetcher,
  );
  return { data, error, isLoading, mutate };
};

// Hook to delete an event by ID
export const useDeleteEvent = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ORGANIZER_ENDPOINTS.DELETE_EVENT(id) : null,
    fetcher,
  );
  return { data, error, isLoading, mutate };
};

// Hook to fetch tickets for a specific event
export const useEventTickets = (
  eventId: string,
  params?: {
    page?: number;
    limit?: number;
  },
) => {
  // Build query string
  let url = eventId ? ORGANIZER_ENDPOINTS.EVENT_TICKETS(eventId) : null;
  if (url && params) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
  }

  const { data, error, isLoading, mutate } = useSWR(url, fetcher);
  return { data, error, isLoading, mutate };
};

// Hook to fetch sales data for a specific event
export const useEventSales = (params?: {
  eventId?: string;
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month";
}) => {
  // Build query string
  let url = ORGANIZER_ENDPOINTS.SALES;
  if (params) {
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

  const { data, error, isLoading, mutate } = useSWR(url, fetcher);
  return { data, error, isLoading, mutate };
};
