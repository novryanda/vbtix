
import useSWR from 'swr';
import { COMMON_ENDPOINTS } from '../endpoints';
import { fetcher } from '../client'; // Import fetcher from client

// Hook to fetch payment data
export const usePayments = () => {
  const { data, error, isLoading, mutate } = useSWR(COMMON_ENDPOINTS.PAYMENTS, fetcher);
  return { data, error, isLoading, mutate };
};

// Hook to fetch notifications
export const useNotifications = () => {
  const { data, error, isLoading, mutate } = useSWR(COMMON_ENDPOINTS.NOTIFICATIONS, fetcher);
  return { data, error, isLoading, mutate };
};
