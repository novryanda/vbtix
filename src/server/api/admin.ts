import {
  getAdminDashboardStats,
  getRecentEvents,
  getRecentOrganizers,
  getRecentUsers,
  getSalesOverview,
  getPendingEvents,
  getPendingOrganizers,
  getEventStats,
  getOrganizerStats
} from "~/server/services/dashboard.service";
import { formatDate } from "~/lib/utils";

/**
 * Mendapatkan statistik untuk dashboard admin
 */
export async function handleGetDashboardStats() {
  try {
    return await getAdminDashboardStats();
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    throw new Error("Failed to retrieve dashboard statistics");
  }
}

/**
 * Mendapatkan daftar event terbaru
 */
export async function handleGetRecentEvents(limit?: number) {
  try {
    const validLimit = limit ? Math.min(20, Math.max(1, Number(limit))) : 5;
    const events = await getRecentEvents(validLimit);

    // Transform data if needed
    return events.map(event => ({
      ...event,
      formattedStartDate: formatDate(event.startDate),
      formattedEndDate: formatDate(event.endDate),
      formattedCreatedAt: formatDate(event.createdAt)
    }));
  } catch (error) {
    console.error("Error getting recent events:", error);
    throw new Error("Failed to retrieve recent events");
  }
}

/**
 * Mendapatkan daftar event yang menunggu persetujuan
 */
export async function handleGetPendingEvents(limit?: number) {
  try {
    const validLimit = limit ? Math.min(20, Math.max(1, Number(limit))) : 5;
    const events = await getPendingEvents(validLimit);

    // Transform data if needed
    return events.map(event => ({
      ...event,
      formattedStartDate: formatDate(event.startDate),
      formattedEndDate: formatDate(event.endDate),
      formattedCreatedAt: formatDate(event.createdAt)
    }));
  } catch (error) {
    console.error("Error getting pending events:", error);
    throw new Error("Failed to retrieve pending events");
  }
}

/**
 * Mendapatkan statistik event
 */
export async function handleGetEventStats() {
  try {
    return await getEventStats();
  } catch (error) {
    console.error("Error getting event stats:", error);
    throw new Error("Failed to retrieve event statistics");
  }
}

/**
 * Mendapatkan daftar organizer terbaru
 */
export async function handleGetRecentOrganizers(limit?: number) {
  try {
    const validLimit = limit ? Math.min(20, Math.max(1, Number(limit))) : 5;
    const organizers = await getRecentOrganizers(validLimit);

    // Transform data if needed
    return organizers.map(organizer => ({
      ...organizer,
      formattedCreatedAt: formatDate(organizer.createdAt),
      eventsCount: organizer.events?.length || 0
    }));
  } catch (error) {
    console.error("Error getting recent organizers:", error);
    throw new Error("Failed to retrieve recent organizers");
  }
}

/**
 * Mendapatkan daftar organizer yang belum diverifikasi
 */
export async function handleGetPendingOrganizers(limit?: number) {
  try {
    const validLimit = limit ? Math.min(20, Math.max(1, Number(limit))) : 5;
    const organizers = await getPendingOrganizers(validLimit);

    // Transform data if needed
    return organizers.map(organizer => ({
      ...organizer,
      formattedCreatedAt: formatDate(organizer.createdAt)
    }));
  } catch (error) {
    console.error("Error getting pending organizers:", error);
    throw new Error("Failed to retrieve pending organizers");
  }
}

/**
 * Mendapatkan statistik organizer
 */
export async function handleGetOrganizerStats() {
  try {
    return await getOrganizerStats();
  } catch (error) {
    console.error("Error getting organizer stats:", error);
    throw new Error("Failed to retrieve organizer statistics");
  }
}

/**
 * Mendapatkan daftar user terbaru
 */
export async function handleGetRecentUsers(limit?: number) {
  try {
    const validLimit = limit ? Math.min(20, Math.max(1, Number(limit))) : 5;
    const users = await getRecentUsers(validLimit);

    // Remove sensitive information
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt
    }));
  } catch (error) {
    console.error("Error getting recent users:", error);
    throw new Error("Failed to retrieve recent users");
  }
}

/**
 * Mendapatkan overview penjualan
 */
export async function handleGetSalesOverview() {
  try {
    const salesData = await getSalesOverview();

    // Format dates and additional processing if needed
    return salesData.map(item => ({
      ...item,
      formattedMonth: formatMonth(item.month),
      totalSalesFormatted: formatCurrency(item.totalSales)
    }));
  } catch (error) {
    console.error("Error getting sales overview:", error);
    throw new Error("Failed to retrieve sales overview");
  }
}

/**
 * Format date helper function (moved to utils.ts)
 */

/**
 * Format month helper function
 */
function formatMonth(date: Date | null | undefined) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
  });
}

/**
 * Format currency helper function
 */
function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
}
