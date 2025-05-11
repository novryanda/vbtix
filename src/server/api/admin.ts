import {
  getAdminDashboardStats,
  getRecentEvents,
  getRecentOrganizers,
  getRecentUsers,
  getSalesOverview
} from "~/server/services/dashboard.service";

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
    const processedEvents = events.map(event => ({
      ...event,
      formattedDate: formatDate(event.startDate)
    }));
    
    return processedEvents;
  } catch (error) {
    console.error("Error getting recent events:", error);
    throw new Error("Failed to retrieve recent events");
  }
}

/**
 * Mendapatkan daftar organizer terbaru
 */
export async function handleGetRecentOrganizers(limit?: number) {
  try {
    const validLimit = limit ? Math.min(20, Math.max(1, Number(limit))) : 5;
    return await getRecentOrganizers(validLimit);
  } catch (error) {
    console.error("Error getting recent organizers:", error);
    throw new Error("Failed to retrieve recent organizers");
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
 * Format date helper function
 */
function formatDate(date: Date | null | undefined) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

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
