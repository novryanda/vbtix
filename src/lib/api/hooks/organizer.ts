
import useSWR from 'swr';
import { ORGANIZER_ENDPOINTS } from '../endpoints';
import { fetcher } from '../client'; // Import fetcher from client

// Hook to fetch organizer dashboard data
export const useOrganizerDashboard = () => {
  const { data, error, isLoading, mutate } = useSWR(ORGANIZER_ENDPOINTS.DASHBOARD, fetcher);
  return { data, error, isLoading, mutate };
};

// Hook to fetch all organizer events
export const useOrganizerEvents = () => {
  const { data, error, isLoading, mutate } = useSWR(ORGANIZER_ENDPOINTS.EVENTS, fetcher);
  return { data, error, isLoading, mutate };
};

// Hook to fetch a specific organizer event by ID
export const useOrganizerEventDetail = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR(id ? ORGANIZER_ENDPOINTS.EVENT_DETAIL(id) : null, fetcher);
  return { data, error, isLoading, mutate };
};

// Hook to create a new event
export const useCreateEvent = () => {
  const { data, error, isLoading, mutate } = useSWR(ORGANIZER_ENDPOINTS.CREATE_EVENT, fetcher);
  return { data, error, isLoading, mutate };
};

// Hook to update an event by ID
export const useUpdateEvent = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR(id ? ORGANIZER_ENDPOINTS.UPDATE_EVENT(id) : null, fetcher);
  return { data, error, isLoading, mutate };
};

// Hook to delete an event by ID
export const useDeleteEvent = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR(id ? ORGANIZER_ENDPOINTS.DELETE_EVENT(id) : null, fetcher);
  return { data, error, isLoading, mutate };
};
