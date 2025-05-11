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
  // Dashboard
  DASHBOARD: `${API_BASE}/organizer/dashboard`,

  // Events
  EVENTS: `${API_BASE}/organizer/events`,
  EVENT_DETAIL: (id: string) => `${API_BASE}/organizer/events/${id}`,
  CREATE_EVENT: `${API_BASE}/organizer/events/create`,
  UPDATE_EVENT: (id: string) => `${API_BASE}/organizer/events/${id}/update`,
  DELETE_EVENT: (id: string) => `${API_BASE}/organizer/events/${id}/delete`,

  // Event Tickets
  EVENT_TICKETS: (eventId: string) =>
    `${API_BASE}/organizer/events/${eventId}/tickets`,

  // Tickets
  TICKETS: `${API_BASE}/organizer/tickets`,
  TICKET_DETAIL: (id: string) => `${API_BASE}/organizer/tickets/${id}`,
  CREATE_TICKET: `${API_BASE}/organizer/tickets/create`,
  UPDATE_TICKET: (id: string) => `${API_BASE}/organizer/tickets/${id}/update`,
  DELETE_TICKET: (id: string) => `${API_BASE}/organizer/tickets/${id}/delete`,

  // Inventory
  INVENTORY: `${API_BASE}/organizer/inventory`,

  // Orders
  ORDERS: `${API_BASE}/organizer/orders`,
  ORDER_DETAIL: (id: string) => `${API_BASE}/organizer/orders/${id}`,

  // Sales
  SALES: `${API_BASE}/organizer/sales`,
  SALES_BY_EVENT: (eventId: string) =>
    `${API_BASE}/organizer/sales/events/${eventId}`,

  // Settings
  SETTINGS: `${API_BASE}/organizer/settings`,
  UPDATE_SETTINGS: `${API_BASE}/organizer/settings/update`,
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
