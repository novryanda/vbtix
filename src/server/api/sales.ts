import { prisma } from "~/server/db";
import { organizerService } from "~/server/services/organizer.service";
import { eventService } from "~/server/services/event.service";

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

  // Build where clause
  const where: any = {
    event: {
      organizerId: organizer.id,
    },
    status: "SUCCESS",
  };

  // Add date filters
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

  // Add event filter
  if (eventId) {
    where.eventId = eventId;
  }

  // Get all successful transactions
  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      event: {
        select: {
          id: true,
          title: true,
        },
      },
      orderItems: {
        include: {
          ticketType: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Group transactions by date according to groupBy parameter
  const salesByDate = transactions.reduce(
    (acc, transaction) => {
      const date = new Date(transaction.createdAt);
      let groupKey = "";

      switch (groupBy) {
        case "week":
          // Get the first day of the week (Sunday)
          const firstDayOfWeek = new Date(date);
          const day = date.getDay();
          const diff = date.getDate() - day;
          firstDayOfWeek.setDate(diff);
          groupKey = firstDayOfWeek.toISOString().split("T")[0] || "";
          break;
        case "month":
          groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          break;
        case "day":
        default:
          groupKey = date.toISOString().split("T")[0] || "";
          break;
      }

      if (!acc[groupKey]) {
        acc[groupKey] = {
          date: groupKey,
          count: 0,
          revenue: 0,
          ticketsSold: 0,
        };
      }

      // We're sure acc[groupKey] exists because we just created it if it didn't
      acc[groupKey]!.count += 1;
      acc[groupKey]!.revenue += Number(transaction.amount);
      acc[groupKey]!.ticketsSold += transaction.orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      return acc;
    },
    {} as Record<
      string,
      { date: string; count: number; revenue: number; ticketsSold: number }
    >,
  );

  // Convert to array and sort by date
  const salesData = Object.values(salesByDate).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  // Calculate totals
  const totalSales = salesData.reduce((sum, item) => sum + item.count, 0);
  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
  const totalTicketsSold = salesData.reduce(
    (sum, item) => sum + item.ticketsSold,
    0,
  );

  return {
    salesData,
    summary: {
      totalSales,
      totalRevenue,
      totalTicketsSold,
      averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0,
    },
  };
}

/**
 * Get sales by ticket type for an organizer
 */
export async function handleGetSalesByTicketType(params: {
  userId: string;
  eventId?: string;
}) {
  const { userId, eventId } = params;

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Build where clause for events
  const whereEvent: any = {
    organizerId: organizer.id,
  };

  // Add event filter
  if (eventId) {
    whereEvent.id = eventId;
  }

  // Get all ticket types for the organizer's events
  const ticketTypes = await prisma.ticketType.findMany({
    where: {
      event: whereEvent,
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  // Get sales data for each ticket type
  const salesByTicketType = await Promise.all(
    ticketTypes.map(async (ticketType) => {
      const soldCount = await prisma.orderItem.aggregate({
        where: {
          ticketTypeId: ticketType.id,
          order: {
            status: "SUCCESS",
          },
        },
        _sum: {
          quantity: true,
          price: true,
        },
      });

      return {
        ticketTypeId: ticketType.id,
        ticketTypeName: ticketType.name,
        eventId: ticketType.eventId,
        eventTitle: ticketType.event.title,
        price: ticketType.price,
        quantitySold: soldCount._sum.quantity || 0,
        revenue: soldCount._sum.price || 0,
        percentageSold:
          ticketType.quantity > 0
            ? Math.round(
                ((soldCount._sum.quantity || 0) / ticketType.quantity) * 100,
              )
            : 0,
      };
    }),
  );

  // Group by event
  const salesByEvent = salesByTicketType.reduce(
    (acc, item) => {
      if (!acc[item.eventId]) {
        acc[item.eventId] = {
          eventId: item.eventId,
          eventTitle: item.eventTitle,
          ticketTypes: [],
          totalSold: 0,
          totalRevenue: 0,
        };
      }

      // We're sure acc[item.eventId] exists because we just created it if it didn't
      acc[item.eventId]!.ticketTypes.push(item);
      acc[item.eventId]!.totalSold += item.quantitySold;
      acc[item.eventId]!.totalRevenue += Number(item.revenue);

      return acc;
    },
    {} as Record<
      string,
      {
        eventId: string;
        eventTitle: string;
        ticketTypes: any[];
        totalSold: number;
        totalRevenue: number;
      }
    >,
  );

  return Object.values(salesByEvent);
}

/**
 * Get sales comparison between events
 */
export async function handleGetEventSalesComparison(params: {
  userId: string;
  eventIds: string[];
}) {
  const { userId, eventIds } = params;

  if (!eventIds || eventIds.length === 0) {
    throw new Error("At least one event ID is required");
  }

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Get events data
  const events = await Promise.all(
    eventIds.map(async (eventId) => {
      // Check if event belongs to the organizer
      const event = await eventService.findById(eventId);
      if (!event) throw new Error(`Event with ID ${eventId} not found`);

      if (event.organizerId !== organizer.id) {
        throw new Error(
          `Event with ID ${eventId} does not belong to this organizer`,
        );
      }

      // Get sales data
      const salesData = await prisma.transaction.aggregate({
        where: {
          eventId,
          status: "SUCCESS",
        },
        _count: true,
        _sum: {
          amount: true,
        },
      });

      // Get tickets sold
      const ticketsSold = await prisma.orderItem.aggregate({
        where: {
          ticketType: {
            eventId,
          },
          order: {
            status: "SUCCESS",
          },
        },
        _sum: {
          quantity: true,
        },
      });

      return {
        eventId,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        salesCount: salesData._count,
        revenue: salesData._sum.amount || 0,
        ticketsSold: ticketsSold._sum.quantity || 0,
      };
    }),
  );

  return events;
}
