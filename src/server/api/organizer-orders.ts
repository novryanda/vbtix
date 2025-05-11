import { prisma } from "~/server/db";
import { organizerService } from "~/server/services/organizer.service";
import { PaymentStatus } from "@prisma/client";

/**
 * Get orders for an organizer's events
 */
export async function handleGetOrganizerOrders(params: {
  userId: string;
  page?: number | string;
  limit?: number | string;
  status?: PaymentStatus;
  eventId?: string;
  search?: string;
}) {
  const { userId, page = 1, limit = 10, status, eventId, search } = params;

  // Validate parameters
  const validPage = Math.max(1, Number(page));
  const validLimit = Math.min(100, Math.max(1, Number(limit)));
  const skip = (validPage - 1) * validLimit;

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
  };

  // Add optional filters
  if (status) {
    where.status = status;
  }

  if (eventId) {
    where.eventId = eventId;
  }

  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  // Get orders
  const [orders, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: validLimit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
    }),
    prisma.transaction.count({ where }),
  ]);

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / validLimit);

  return {
    orders: orders.map((order) => ({
      ...order,
      formattedDate: formatDate(order.createdAt),
    })),
    meta: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages,
    },
  };
}

/**
 * Get order details for an organizer
 */
export async function handleGetOrganizerOrderById(params: {
  userId: string;
  orderId: string;
}) {
  const { userId, orderId } = params;

  if (!orderId) throw new Error("Order ID is required");

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Get order details
  const order = await prisma.transaction.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
          organizerId: true,
        },
      },
      orderItems: {
        include: {
          ticketType: true,
        },
      },
      tickets: true,
      payments: true,
    },
  });

  if (!order) throw new Error("Order not found");

  // Check if the order is for an event organized by this organizer
  if (order.event.organizerId !== organizer.id) {
    throw new Error("Order does not belong to this organizer's events");
  }

  return {
    ...order,
    formattedDate: formatDate(order.createdAt),
  };
}

/**
 * Get recent orders for an organizer's dashboard
 */
export async function handleGetRecentOrganizerOrders(params: {
  userId: string;
  limit?: number;
}) {
  const { userId, limit = 5 } = params;

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Get recent orders
  const recentOrders = await prisma.transaction.findMany({
    where: {
      event: {
        organizerId: organizer.id,
      },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
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
  });

  return recentOrders.map((order) => ({
    ...order,
    formattedDate: formatDate(order.createdAt),
  }));
}

/**
 * Get order statistics for an organizer
 */
export async function handleGetOrganizerOrderStats(params: {
  userId: string;
  eventId?: string;
}) {
  const { userId, eventId } = params;

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
  };

  // Add optional event filter
  if (eventId) {
    where.eventId = eventId;
  }

  // Get order statistics
  const [totalOrders, pendingOrders, successfulOrders, failedOrders] =
    await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.count({ where: { ...where, status: "PENDING" } }),
      prisma.transaction.count({ where: { ...where, status: "SUCCESS" } }),
      prisma.transaction.count({ where: { ...where, status: "FAILED" } }),
    ]);

  // Calculate total revenue
  const revenue = await prisma.transaction.aggregate({
    where: { ...where, status: "SUCCESS" },
    _sum: {
      amount: true,
    },
  });

  return {
    totalOrders,
    pendingOrders,
    successfulOrders,
    failedOrders,
    totalRevenue: revenue._sum.amount || 0,
  };
}

/**
 * Format date helper function
 */
function formatDate(date: Date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
