import { organizerService } from "~/server/services/organizer.service";
import { prisma } from "~/server/db";
import { formatDate } from "~/lib/utils";

/**
 * Get sales report for an organizer
 */
export async function handleGetOrganizerSalesReport(params: {
  userId: string;
  startDate?: string;
  endDate?: string;
  eventId?: string;
  groupBy?: "day" | "week" | "month";
}) {
  const { userId, startDate, endDate, eventId, groupBy = "day" } = params;

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Build where clause for transactions
  const where: any = {
    event: {
      organizerId: organizer.id,
    },
    status: "SUCCESS", // Only count successful transactions
  };

  // Add date filters if provided
  if (startDate) {
    where.createdAt = {
      ...(where.createdAt || {}),
      gte: new Date(startDate),
    };
  }

  if (endDate) {
    where.createdAt = {
      ...(where.createdAt || {}),
      lte: new Date(endDate),
    };
  }

  // Add event filter if provided
  if (eventId) {
    where.eventId = eventId;
  }

  // Get all transactions matching the criteria
  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      orderItems: true,
      tickets: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Group transactions by date according to groupBy parameter
  const salesByDate = new Map<string, { count: number; revenue: number; ticketsSold: number }>();

  transactions.forEach((transaction) => {
    let dateKey: string;
    const date = new Date(transaction.createdAt);

    // Format date key based on groupBy parameter
    switch (groupBy) {
      case "week":
        // Get the first day of the week (Sunday)
        const firstDayOfWeek = new Date(date);
        const day = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
        firstDayOfWeek.setDate(date.getDate() - day);
        dateKey = formatDate(firstDayOfWeek);
        break;
      case "month":
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
      case "day":
      default:
        dateKey = formatDate(date);
        break;
    }

    // Initialize or update the data for this date
    const existingData = salesByDate.get(dateKey) || { count: 0, revenue: 0, ticketsSold: 0 };

    // Only count ACTIVE and USED tickets as sold
    const soldTicketsCount = transaction.tickets.filter(ticket =>
      ticket.status === 'ACTIVE' || ticket.status === 'USED'
    ).length;

    salesByDate.set(dateKey, {
      count: existingData.count + 1,
      revenue: existingData.revenue + Number(transaction.amount),
      ticketsSold: existingData.ticketsSold + soldTicketsCount,
    });
  });

  // Convert Map to array and sort by date
  const salesData = Array.from(salesByDate.entries()).map(([date, data]) => ({
    date,
    count: data.count,
    ticketsSold: data.ticketsSold,
    revenue: data.revenue,
  })).sort((a, b) => a.date.localeCompare(b.date));

  // Calculate totals
  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
  const totalTicketsSold = salesData.reduce((sum, item) => sum + item.ticketsSold, 0);
  const totalSales = salesData.reduce((sum, item) => sum + item.count, 0);

  return {
    salesData,
    totalRevenue,
    totalTicketsSold,
    totalSales,
  };
}
