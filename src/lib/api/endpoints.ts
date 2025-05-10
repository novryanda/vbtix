/**
 * API endpoints for the application
 * Organized based on the API structure in src/app/api
 */

// Base API URL
const API_BASE = "/api";

// Auth endpoints
export const AUTH_ENDPOINTS = {
  REGISTER: `${API_BASE}/auth/register`,
  VERIFY: `${API_BASE}/auth/verify`,
  VERIFY_TOKEN: (token: string) => `${API_BASE}/auth/verify/${token}`,
  RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
  RESET_PASSWORD_TOKEN: (token: string) => `${API_BASE}/auth/reset-password/${token}`,
  NEXTAUTH: `${API_BASE}/auth/signin`,
};

// Admin endpoints
export const ADMIN_ENDPOINTS = {
  // Dashboard
  DASHBOARD: `${API_BASE}/admin/dashboard`,

  // Events
  EVENTS: `${API_BASE}/admin/events`,
  EVENT_DETAIL: (id: string) => `${API_BASE}/admin/events/${id}`,
  EVENT_PENDING: `${API_BASE}/admin/events/pending`,
  EVENT_REVIEW: `${API_BASE}/admin/events`,  // POST to review an event
  EVENT_STATISTICS: (id: string) => `${API_BASE}/admin/events/${id}/statistics`,
  EVENT_FEATURED: (id: string) => `${API_BASE}/admin/events/${id}/featured`,

  // Users
  USERS: `${API_BASE}/admin/users`,
  USER_DETAIL: (id: string) => `${API_BASE}/admin/users/${id}`,

  // Organizers
  ORGANIZERS: `${API_BASE}/admin/organizers`,
  ORGANIZER_DETAIL: (id: string) => `${API_BASE}/admin/organizers/${id}`,

  // Reports
  REPORTS: `${API_BASE}/admin/reports`,
  REPORTS_SALES: `${API_BASE}/admin/reports/sales`,
  REPORTS_EVENTS: `${API_BASE}/admin/reports/events`,
};

// Buyer endpoints
export const BUYER_ENDPOINTS = {
  // Events
  EVENTS: `${API_BASE}/buyer/events`,
  EVENT_DETAIL: (id: string) => `${API_BASE}/buyer/events/${id}`,

  // Tickets
  TICKETS: `${API_BASE}/buyer/tickets`,

  // Orders
  ORDERS: `${API_BASE}/buyer/orders`,
  ORDER_DETAIL: (id: string) => `${API_BASE}/buyer/orders/${id}`,

  // E-Tickets
  ETICKETS: `${API_BASE}/buyer/etickets`,
  ETICKET_DETAIL: (id: string) => `${API_BASE}/buyer/etickets/${id}`,
  ETICKET_DOWNLOAD: (id: string) => `${API_BASE}/buyer/etickets/${id}/download`,
};

// Organizer endpoints
export const ORGANIZER_ENDPOINTS = {
  // Events
  EVENTS: `${API_BASE}/organizer/events`,
  EVENT_DETAIL: (id: string) => `${API_BASE}/organizer/events/${id}`,

  // Tickets
  TICKETS: `${API_BASE}/organizer/tickets`,

  // Inventory
  INVENTORY: `${API_BASE}/organizer/inventory`,

  // Orders
  ORDERS: `${API_BASE}/organizer/orders`,

  // Sales
  SALES: `${API_BASE}/organizer/sales`,
};

// Payment endpoints
export const PAYMENT_ENDPOINTS = {
  // General
  LIST: `${API_BASE}/payments`,
  DETAIL: (id: string) => `${API_BASE}/payments/${id}`,

  // Midtrans
  MIDTRANS_CREATE: `${API_BASE}/payments/midtrans/create`,
  MIDTRANS_STATUS: `${API_BASE}/payments/midtrans/status`,
  MIDTRANS_WEBHOOK: `${API_BASE}/payments/midtrans/webhook`,

  // Xendit
  XENDIT_WEBHOOK: `${API_BASE}/payments/xendit/webhook`,
};

// Webhook endpoints
export const WEBHOOK_ENDPOINTS = {
  STRIPE: `${API_BASE}/webhooks/stripe`,
};

// Event endpoints (general)
export const EVENT_ENDPOINTS = {
  LIST: `${API_BASE}/events`,
  DETAIL: (id: string) => `${API_BASE}/events/${id}`,
  CREATE: `${API_BASE}/events`,
  UPDATE: (id: string) => `${API_BASE}/events/${id}`,
  DELETE: (id: string) => `${API_BASE}/events/${id}`,
  SUBMIT: (id: string) => `${API_BASE}/events/${id}/submit`,
  CATEGORIES: `${API_BASE}/events/categories`,
  TICKETS: (id: string) => `${API_BASE}/events/${id}/tickets`,
};

// Revalidation endpoints
export const REVALIDATE_ENDPOINTS = {
  REVALIDATE: `${API_BASE}/revalidate`,
};
