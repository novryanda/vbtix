import { prisma } from "~/server/db";
import { organizerService } from "~/server/services/organizer.service";
import { eventService } from "~/server/services/event.service";
import { ticketService } from "~/server/services/ticket.service";
import { paymentMethodService } from "~/server/services/payment-method.service";
import { Prisma, TicketStatus } from "@prisma/client";

/**
 * Get ticket types for an event
 */
export async function handleGetTicketTypes(params: {
  eventId: string;
  page?: number | string;
  limit?: number | string;
}) {
  const { eventId, page = 1, limit = 10 } = params;

  if (!eventId) throw new Error("Event ID is required");

  // Validate parameters
  const validPage = Math.max(1, Number(page));
  const validLimit = Math.min(100, Math.max(1, Number(limit)));
  const skip = (validPage - 1) * validLimit;

  // Check if event exists
  const event = await eventService.findById(eventId);
  if (!event) throw new Error("Event not found");

  // Get ticket types
  const [ticketTypes, total] = await Promise.all([
    prisma.ticketType.findMany({
      where: { eventId },
      skip,
      take: validLimit,
      orderBy: { price: "asc" },
    }),
    prisma.ticketType.count({
      where: { eventId },
    }),
  ]);

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / validLimit);

  return {
    ticketTypes,
    meta: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages,
    },
  };
}

/**
 * Get a specific ticket type by ID
 */
export async function handleGetTicketTypeById(params: {
  userId: string;
  ticketTypeId: string;
}) {
  const { userId, ticketTypeId } = params;

  if (!ticketTypeId) throw new Error("Ticket Type ID is required");

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Get ticket type
  const ticketType = await prisma.ticketType.findUnique({
    where: { id: ticketTypeId },
    include: {
      event: true,
      _count: {
        select: {
          tickets: true,
        },
      },
    },
  });

  if (!ticketType) throw new Error("Ticket type not found");

  // Check if the ticket type belongs to the organizer's event
  if (ticketType.event.organizerId !== organizer.id) {
    throw new Error("Ticket type does not belong to this organizer's event");
  }

  // Get sold and pending tickets count
  const soldCount = await prisma.ticket.count({
    where: {
      ticketTypeId,
      status: {
        in: ["ACTIVE", "USED"], // Only count approved tickets as sold
      },
    },
  });

  const pendingCount = await prisma.ticket.count({
    where: {
      ticketTypeId,
      status: "PENDING", // Count pending tickets separately
    },
  });

  return {
    ...ticketType,
    sold: soldCount,
    pending: pendingCount,
    available: ticketType.quantity - soldCount - pendingCount,
  };
}

/**
 * Create a new ticket type for an event
 * Only allows ticket creation for PUBLISHED (approved) events
 */
export async function handleCreateTicketType(params: {
  userId: string;
  eventId: string;
  ticketTypeData: any; // Use any to avoid type conflicts with transformed data
}) {
  const { userId, eventId, ticketTypeData } = params;

  if (!eventId) throw new Error("Event ID is required");

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // CRITICAL: Validate event approval status and ownership using service layer
  const validationResult = await ticketService.validateEventApprovalForTickets(
    eventId,
    organizer.id
  );

  console.log("Event validation result:", validationResult);

  // Prepare data for Prisma, ensuring datetime fields are properly handled
  const prismaData: Prisma.TicketTypeCreateInput = {
    name: ticketTypeData.name,
    description: ticketTypeData.description || null,
    price: ticketTypeData.price,
    currency: ticketTypeData.currency || "IDR",
    quantity: ticketTypeData.quantity,
    maxPerPurchase: ticketTypeData.maxPerPurchase || 10,
    isVisible: ticketTypeData.isVisible ?? true,
    allowTransfer: ticketTypeData.allowTransfer ?? false,
    ticketFeatures: ticketTypeData.ticketFeatures || null,
    perks: ticketTypeData.perks || null,
    logoUrl: ticketTypeData.logoUrl || null,
    logoPublicId: ticketTypeData.logoPublicId || null,
    // Convert datetime strings to Date objects for Prisma
    earlyBirdDeadline: ticketTypeData.earlyBirdDeadline ? new Date(ticketTypeData.earlyBirdDeadline) : null,
    saleStartDate: ticketTypeData.saleStartDate ? new Date(ticketTypeData.saleStartDate) : null,
    saleEndDate: ticketTypeData.saleEndDate ? new Date(ticketTypeData.saleEndDate) : null,
    event: { connect: { id: eventId } },
  };

  console.log("Creating ticket type with data:", JSON.stringify(prismaData, null, 2));

  // Create ticket type and handle payment method associations in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create ticket type
    const ticketType = await tx.ticketType.create({
      data: prismaData,
    });

    // Handle payment method associations
    if (ticketTypeData.allowedPaymentMethodIds && ticketTypeData.allowedPaymentMethodIds.length > 0) {
      // Validate that all payment method IDs exist
      const existingPaymentMethods = await tx.paymentMethod.findMany({
        where: {
          id: { in: ticketTypeData.allowedPaymentMethodIds },
          isActive: true,
        },
        select: { id: true },
      });



      if (existingPaymentMethods.length !== ticketTypeData.allowedPaymentMethodIds.length) {
        const existingIds = existingPaymentMethods.map(pm => pm.id);
        const missingIds = ticketTypeData.allowedPaymentMethodIds.filter((id: string) => !existingIds.includes(id));
        throw new Error(`Invalid payment method IDs: ${missingIds.join(', ')}`);
      }

      // Create associations with specified payment methods
      await tx.ticketTypePaymentMethod.createMany({
        data: ticketTypeData.allowedPaymentMethodIds.map((paymentMethodId: string) => ({
          ticketTypeId: ticketType.id,
          paymentMethodId,
        })),
      });
    } else {
      // If no payment methods specified, allow all active payment methods for backward compatibility
      const activePaymentMethods = await tx.paymentMethod.findMany({
        where: { isActive: true },
        select: { id: true },
      });

      if (activePaymentMethods.length > 0) {
        await tx.ticketTypePaymentMethod.createMany({
          data: activePaymentMethods.map((pm) => ({
            ticketTypeId: ticketType.id,
            paymentMethodId: pm.id,
          })),
        });
      }
    }

    return ticketType;
  });

  return result;
}

/**
 * Update a ticket type
 */
export async function handleUpdateTicketType(params: {
  userId: string;
  ticketTypeId: string;
  ticketTypeData: any; // Use any to handle allowedPaymentMethodIds
}) {
  const { userId, ticketTypeId, ticketTypeData } = params;

  if (!ticketTypeId) throw new Error("Ticket Type ID is required");

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Check if ticket type exists
  const ticketType = await prisma.ticketType.findUnique({
    where: { id: ticketTypeId },
    include: { event: true },
  });

  if (!ticketType) throw new Error("Ticket type not found");

  // Check if the event belongs to the organizer
  if (ticketType.event.organizerId !== organizer.id) {
    throw new Error("Ticket type does not belong to this organizer's event");
  }

  // Extract allowedPaymentMethodIds from ticketTypeData
  const { allowedPaymentMethodIds, ...updateData } = ticketTypeData;

  // Update ticket type and handle payment method associations in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update ticket type
    const updatedTicketType = await tx.ticketType.update({
      where: { id: ticketTypeId },
      data: updateData,
    });

    // Handle payment method associations if provided
    if (allowedPaymentMethodIds !== undefined) {
      // First, delete existing associations
      await tx.ticketTypePaymentMethod.deleteMany({
        where: { ticketTypeId },
      });

      // Then, create new associations if any payment methods are specified
      if (allowedPaymentMethodIds.length > 0) {
        await tx.ticketTypePaymentMethod.createMany({
          data: allowedPaymentMethodIds.map((paymentMethodId: string) => ({
            ticketTypeId,
            paymentMethodId,
          })),
        });
      }
    }

    return updatedTicketType;
  });

  return result;
}

/**
 * Delete a ticket type
 */
export async function handleDeleteTicketType(params: {
  userId: string;
  ticketTypeId: string;
}) {
  const { userId, ticketTypeId } = params;

  if (!ticketTypeId) throw new Error("Ticket Type ID is required");

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Check if ticket type exists
  const ticketType = await prisma.ticketType.findUnique({
    where: { id: ticketTypeId },
    include: { event: true },
  });

  if (!ticketType) throw new Error("Ticket type not found");

  // Check if the event belongs to the organizer
  if (ticketType.event.organizerId !== organizer.id) {
    throw new Error("Ticket type does not belong to this organizer's event");
  }

  // Check if tickets have been sold or are pending for this ticket type
  const committedTicketsCount = await prisma.ticket.count({
    where: {
      ticketTypeId,
      status: { in: ["ACTIVE", "USED", "PENDING"] }, // Include pending tickets
    },
  });

  if (committedTicketsCount > 0) {
    throw new Error("Cannot delete ticket type with sold or pending tickets");
  }

  // Delete ticket type
  const deletedTicketType = await prisma.ticketType.delete({
    where: { id: ticketTypeId },
  });

  return deletedTicketType;
}

/**
 * Count sold tickets by event ID
 */
export async function countSoldTicketsByEventId(eventId: string) {
  if (!eventId) throw new Error("Event ID is required");

  return await prisma.ticket.count({
    where: {
      ticketType: {
        eventId,
      },
      status: {
        in: ["ACTIVE", "USED"], // Count both ACTIVE and USED tickets as sold
      },
    },
  });
}

/**
 * Calculate revenue by event ID
 */
export async function calculateRevenueByEventId(eventId: string) {
  if (!eventId) throw new Error("Event ID is required");

  const result = await prisma.orderItem.aggregate({
    where: {
      ticketType: {
        eventId,
      },
      order: {
        status: "SUCCESS",
      },
    },
    _sum: {
      price: true,
    },
  });

  return result._sum.price || 0;
}

/**
 * Count sold tickets by organizer ID
 */
export async function countSoldTicketsByOrganizerId(organizerId: string) {
  if (!organizerId) throw new Error("Organizer ID is required");

  return await prisma.ticket.count({
    where: {
      ticketType: {
        event: {
          organizerId,
        },
      },
      status: {
        in: ["ACTIVE", "USED"], // Count both ACTIVE and USED tickets as sold
      },
    },
  });
}

/**
 * Calculate revenue by organizer ID
 */
export async function calculateRevenueByOrganizerId(organizerId: string) {
  if (!organizerId) throw new Error("Organizer ID is required");

  const result = await prisma.orderItem.aggregate({
    where: {
      ticketType: {
        event: {
          organizerId,
        },
      },
      order: {
        status: "SUCCESS",
      },
    },
    _sum: {
      price: true,
    },
  });

  return result._sum.price || 0;
}

/**
 * Get all ticket types for an organizer with pagination
 */
export async function handleGetOrganizerTickets(params: {
  userId: string;
  page?: number | string;
  limit?: number | string;
  eventId?: string;
  search?: string;
}) {
  const { userId, page = 1, limit = 10, eventId, search } = params;

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
  const where: Prisma.TicketTypeWhereInput = {
    event: {
      organizerId: organizer.id,
    },
  };

  // Add optional event filter
  if (eventId) {
    where.eventId = eventId;
  }

  // Add search filter
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Get ticket types
  const [ticketTypes, total] = await Promise.all([
    prisma.ticketType.findMany({
      where,
      skip,
      take: validLimit,
      orderBy: [{ eventId: "asc" }, { price: "asc" }],
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
          },
        },
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    }),
    prisma.ticketType.count({ where }),
  ]);

  // Calculate sold and available tickets
  const ticketTypesWithStats = await Promise.all(
    ticketTypes.map(async (ticketType) => {
      const soldCount = await prisma.ticket.count({
        where: {
          ticketTypeId: ticketType.id,
          status: {
            in: ["ACTIVE", "USED"],
          },
        },
      });

      return {
        ...ticketType,
        sold: soldCount,
        available: ticketType.quantity - soldCount,
      };
    }),
  );

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / validLimit);

  return {
    ticketTypes: ticketTypesWithStats,
    meta: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages,
    },
  };
}
