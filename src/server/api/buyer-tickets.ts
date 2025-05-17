import { ticketService } from "~/server/services/ticket.service";
import { eventService } from "~/server/services/event.service";
import { prisma } from "~/server/db";
import { TicketStatus } from "@prisma/client";
import { formatDate } from "~/lib/utils";
import { generateUniqueCode } from "~/lib/utils/generators";

/**
 * Get tickets for a user
 */
export async function handleGetUserTickets(params: {
  userId: string;
  page?: number | string;
  limit?: number | string;
  status?: TicketStatus;
}) {
  const { userId, page = 1, limit = 10, status } = params;

  // Validate parameters
  const validPage = Math.max(1, Number(page));
  const validLimit = Math.min(100, Math.max(1, Number(limit)));

  // Use the ticket service to get tickets
  const { tickets, total } = await ticketService.findAll({
    userId,
    page: validPage,
    limit: validLimit,
    status,
  });

  // Process tickets for response
  const processedTickets = tickets.map((ticket) => ({
    id: ticket.id,
    qrCode: ticket.qrCode,
    status: ticket.status,
    checkedIn: ticket.checkedIn,
    checkInTime: ticket.checkInTime,
    createdAt: ticket.createdAt,
    formattedCreatedAt: formatDate(ticket.createdAt),
    ticketType: {
      id: ticket.ticketType.id,
      name: ticket.ticketType.name,
      price: Number(ticket.ticketType.price),
      currency: ticket.ticketType.currency,
    },
    event: {
      id: ticket.ticketType.event.id,
      title: ticket.ticketType.event.title,
      venue: ticket.ticketType.event.venue,
      startDate: ticket.ticketType.event.startDate,
      endDate: ticket.ticketType.event.endDate,
      formattedStartDate: formatDate(ticket.ticketType.event.startDate),
      formattedEndDate: formatDate(ticket.ticketType.event.endDate),
      posterUrl: ticket.ticketType.event.posterUrl,
      organizer: ticket.ticketType.event.organizer,
    },
    transaction: ticket.user ? null : ticket.transaction,
  }));

  // Return tickets with pagination metadata
  return {
    tickets: processedTickets,
    meta: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages: Math.ceil(total / validLimit),
    },
  };
}

/**
 * Get a specific ticket by ID
 */
export async function handleGetTicketById(params: {
  ticketId: string;
  userId: string;
}) {
  const { ticketId, userId } = params;

  // Get ticket using the service
  const ticket = await ticketService.findById(ticketId);

  if (!ticket || ticket.userId !== userId) {
    throw new Error("Ticket not found");
  }

  // Process ticket for response
  const processedTicket = {
    id: ticket.id,
    qrCode: ticket.qrCode,
    status: ticket.status,
    checkedIn: ticket.checkedIn,
    checkInTime: ticket.checkInTime,
    createdAt: ticket.createdAt,
    formattedCreatedAt: formatDate(ticket.createdAt),
    ticketType: {
      id: ticket.ticketType.id,
      name: ticket.ticketType.name,
      price: Number(ticket.ticketType.price),
      currency: ticket.ticketType.currency,
    },
    event: {
      id: ticket.ticketType.event.id,
      title: ticket.ticketType.event.title,
      venue: ticket.ticketType.event.venue,
      address: ticket.ticketType.event.address,
      city: ticket.ticketType.event.city,
      province: ticket.ticketType.event.province,
      startDate: ticket.ticketType.event.startDate,
      endDate: ticket.ticketType.event.endDate,
      formattedStartDate: formatDate(ticket.ticketType.event.startDate),
      formattedEndDate: formatDate(ticket.ticketType.event.endDate),
      posterUrl: ticket.ticketType.event.posterUrl,
      organizer: ticket.ticketType.event.organizer,
    },
    transaction: ticket.transaction
      ? {
          ...ticket.transaction,
          amount: Number(ticket.transaction.amount),
          formattedCreatedAt: formatDate(ticket.transaction.createdAt),
        }
      : null,
    user: ticket.user,
  };

  return processedTicket;
}

/**
 * Purchase tickets
 */
export async function handlePurchaseTickets(params: {
  userId: string;
  items: Array<{
    ticketTypeId: string;
    quantity: number;
  }>;
}) {
  const { userId, items } = params;

  // Validate items
  if (!items || items.length === 0) {
    throw new Error("No items provided");
  }

  // Get ticket types
  const ticketTypeIds = items.map((item) => item.ticketTypeId);
  const ticketTypes = await prisma.ticketType.findMany({
    where: {
      id: { in: ticketTypeIds },
      isVisible: true,
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          organizerId: true,
        },
      },
    },
  });

  // Validate ticket types
  if (ticketTypes.length !== ticketTypeIds.length) {
    throw new Error("One or more ticket types not found");
  }

  // Check if tickets are available
  for (const item of items) {
    const ticketType = ticketTypes.find((tt) => tt.id === item.ticketTypeId);
    // Add null check for ticketType
    if (!ticketType) {
      throw new Error(`Ticket type not found: ${item.ticketTypeId}`);
    }

    const available = ticketType.quantity - ticketType.sold;
    if (item.quantity > available) {
      throw new Error(`Not enough tickets available for ${ticketType.name}`);
    }

    if (item.quantity > ticketType.maxPerPurchase) {
      throw new Error(
        `Maximum ${ticketType.maxPerPurchase} tickets per purchase for ${ticketType.name}`,
      );
    }
  }

  // Calculate total amount
  let totalAmount = 0;
  const orderItems: Array<{
    ticketTypeId: string;
    quantity: number;
    price: any; // Using 'any' for Decimal type compatibility
  }> = [];
  for (const item of items) {
    const ticketType = ticketTypes.find((tt) => tt.id === item.ticketTypeId);
    if (!ticketType) continue;

    const itemPrice = Number(ticketType.price) * item.quantity;
    totalAmount += itemPrice;

    orderItems.push({
      ticketTypeId: ticketType.id,
      quantity: item.quantity,
      price: ticketType.price,
    });
  }

  // Get event ID (assuming all tickets are for the same event)
  // We've already validated that ticketTypes has at least one item
  // by checking ticketTypes.length !== ticketTypeIds.length
  const eventId = ticketTypes[0]?.event.id;

  if (!eventId) {
    throw new Error("Could not determine event ID");
  }

  // Create transaction in a transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Create transaction
    const transaction = await tx.transaction.create({
      data: {
        userId,
        eventId,
        amount: totalAmount,
        currency: "IDR", // Default currency
        paymentMethod: "PENDING", // Will be updated after payment
        invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        status: "PENDING",
        orderItems: {
          create: orderItems.map((item) => ({
            ticketTypeId: item.ticketTypeId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Create tickets
    const tickets: Array<{
      ticketTypeId: string;
      transactionId: string;
      userId: string;
      qrCode: string;
      status: TicketStatus;
    }> = [];
    for (const item of orderItems) {
      for (let i = 0; i < item.quantity; i++) {
        tickets.push({
          ticketTypeId: item.ticketTypeId,
          transactionId: transaction.id,
          userId,
          qrCode: generateUniqueCode(),
          status: TicketStatus.ACTIVE, // Using enum value instead of string
        });
      }
    }

    await tx.ticket.createMany({
      data: tickets,
    });

    // Update ticket type sold count
    for (const item of orderItems) {
      await tx.ticketType.update({
        where: { id: item.ticketTypeId },
        data: {
          sold: {
            increment: item.quantity,
          },
        },
      });
    }

    return { transaction, tickets };
  });

  return result;
}
