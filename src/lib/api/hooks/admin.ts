'use client';

import useSWR from 'swr';
import { ADMIN_ENDPOINTS } from '../endpoints';
import { fetcher } from '../client'; // Import fetcher from client

// Hook to fetch admin dashboard data
export const useAdminDashboard = () => {
  // Tambahkan parameter limit untuk menghindari error validasi
  const { data, error, isLoading, mutate } = useSWR(`${ADMIN_ENDPOINTS.DASHBOARD}?limit=5`, fetcher);

  // Ekstrak data stats dari respons API
  const dashboardData = data?.data?.stats;

  return {
    data: dashboardData,
    error,
    isLoading,
    mutate
  };
};

// Hook to fetch all admin events
export const useAdminEvents = () => {
  const { data, error, isLoading, mutate } = useSWR(ADMIN_ENDPOINTS.EVENTS, fetcher);

  // Tambahkan penanganan error
  if (error) {
    console.error("Error fetching admin events:", error);
  }

  return {
    data,
    error,
    isLoading,
    mutate
  };
};

// Hook to fetch a specific admin event by ID
export const useAdminEventDetail = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR(id ? ADMIN_ENDPOINTS.EVENT_DETAIL(id) : null, fetcher);
  return { data, error, isLoading, mutate };
};

// Hook to fetch all admin users
export const useAdminUsers = () => {
  const { data, error, isLoading, mutate } = useSWR(ADMIN_ENDPOINTS.USERS, fetcher);
  return { data, error, isLoading, mutate };
};

// Hook to fetch a specific admin user by ID
export const useAdminUserDetail = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR(id ? ADMIN_ENDPOINTS.USER_DETAIL(id) : null, fetcher);
  return { data, error, isLoading, mutate };
};
