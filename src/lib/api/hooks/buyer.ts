'use client';

import useSWR from 'swr';
import { BUYER_ENDPOINTS } from '../endpoints';
import { fetcher } from '../client'; // Import fetcher from client

// Hook to fetch all buyer events
export const useBuyerEvents = () => {
  const { data, error, isLoading, mutate } = useSWR(BUYER_ENDPOINTS.EVENTS, fetcher);
  return { data, error, isLoading, mutate };
};

// Hook to fetch a specific buyer event by ID
export const useBuyerEventDetail = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR(id ? BUYER_ENDPOINTS.EVENT_DETAIL(id) : null, fetcher);
  return { data, error, isLoading, mutate };
};

// Hook to purchase a ticket
export const usePurchaseTicket = () => {
  const { data, error, isLoading, mutate } = useSWR(BUYER_ENDPOINTS.PURCHASE_TICKET, fetcher);
  return { data, error, isLoading, mutate };
};

// Hook to cancel a ticket by ID
export const useCancelTicket = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR(id ? BUYER_ENDPOINTS.CANCEL_TICKET(id) : null, fetcher);
  return { data, error, isLoading, mutate };
};
