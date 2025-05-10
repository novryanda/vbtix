// Base API URL
const API_BASE = "/api";

// Auth endpoints
export const AUTH_ENDPOINTS = {
  REGISTER: `${API_BASE}/auth/register`,
  LOGIN: `${API_BASE}/auth/login`,
  VERIFY: `${API_BASE}/auth/verify`,
  RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
  LOGOUT: `${API_BASE}/auth/logout`,
  REFRESH_TOKEN: `${API_BASE}/auth/refresh-token`,
};

// Admin endpoints
export const ADMIN_ENDPOINTS = {
  DASHBOARD: `${API_BASE}/admin/dashboard`,
  EVENTS: `${API_BASE}/admin/events`,
  EVENT_DETAIL: (id: string) => `${API_BASE}/admin/events/${id}`,
  USERS: `${API_BASE}/admin/users`,
  USER_DETAIL: (id: string) => `${API_BASE}/admin/users/${id}`,
};

// Organizer endpoints
export const ORGANIZER_ENDPOINTS = {
  DASHBOARD: `${API_BASE}/organizer/dashboard`,
  EVENTS: `${API_BASE}/organizer/events`,
  EVENT_DETAIL: (id: string) => `${API_BASE}/organizer/events/${id}`,
  CREATE_EVENT: `${API_BASE}/organizer/events/create`,
  UPDATE_EVENT: (id: string) => `${API_BASE}/organizer/events/${id}/update`,
  DELETE_EVENT: (id: string) => `${API_BASE}/organizer/events/${id}/delete`,
};

// Buyer endpoints
export const BUYER_ENDPOINTS = {
  EVENTS: `${API_BASE}/buyer/events`,
  EVENT_DETAIL: (id: string) => `${API_BASE}/buyer/events/${id}`,
  PURCHASE_TICKET: `${API_BASE}/buyer/tickets/purchase`,
  CANCEL_TICKET: (id: string) => `${API_BASE}/buyer/tickets/${id}/cancel`,
};

// Common endpoints
export const COMMON_ENDPOINTS = {
  PAYMENTS: `${API_BASE}/payments`,
  NOTIFICATIONS: `${API_BASE}/notifications`,
};
