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
 * Soft delete a ticket type
 */
export async function handleDeleteTicketType(params: {
  userId: string;
  ticketTypeId: string;
  reason?: string;
}) {
  const { userId, ticketTypeId, reason } = params;

  if (!ticketTypeId) throw new Error("Ticket Type ID is required");

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Check if ticket type exists and is not already deleted
  const ticketType = await prisma.ticketType.findUnique({
    where: {
      id: ticketTypeId,
      deletedAt: null // Only find non-deleted ticket types
    },
    include: { event: true },
  });

  if (!ticketType) throw new Error("Ticket type not found or already deleted");

  // Check if the event belongs to the organizer
  if (ticketType.event.organizerId !== organizer.id) {
    throw new Error("Ticket type does not belong to this organizer's event");
  }

  // Soft delete the ticket type (allow deletion even with sold tickets for soft delete)
  const deletedTicketType = await prisma.ticketType.update({
    where: { id: ticketTypeId },
    data: {
      deletedAt: new Date(),
      deletedBy: userId,
      deletionReason: reason,
      isVisible: false, // Hide from public view
    },
  });

  return deletedTicketType;
}

/**
 * Bulk operations on ticket types
 */
export async function handleBulkTicketTypeOperation(params: {
  userId: string;
  ticketTypeIds: string[];
  operation: "delete" | "activate" | "deactivate" | "export";
  reason?: string;
}) {
  const { userId, ticketTypeIds, operation, reason } = params;

  if (!ticketTypeIds.length) throw new Error("At least one ticket type must be selected");

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Verify all ticket types belong to the organizer's events
  const ticketTypes = await prisma.ticketType.findMany({
    where: {
      id: { in: ticketTypeIds },
      deletedAt: null,
      event: {
        organizerId: organizer.id,
      },
    },
    include: { event: true },
  });

  if (ticketTypes.length !== ticketTypeIds.length) {
    throw new Error("Some ticket types not found or access denied");
  }

  let results: any[] = [];

  switch (operation) {
    case "delete":
      results = await Promise.all(
        ticketTypes.map(async (ticketType) => {
          return await prisma.ticketType.update({
            where: { id: ticketType.id },
            data: {
              deletedAt: new Date(),
              deletedBy: userId,
              deletionReason: reason,
              isVisible: false,
            },
          });
        })
      );
      break;

    case "activate":
      results = await prisma.ticketType.updateMany({
        where: { id: { in: ticketTypeIds } },
        data: { isVisible: true },
      });
      break;

    case "deactivate":
      results = await prisma.ticketType.updateMany({
        where: { id: { in: ticketTypeIds } },
        data: { isVisible: false },
      });
      break;

    case "export":
      // Return ticket types data for export
      results = ticketTypes;
      break;

    default:
      throw new Error("Invalid operation");
  }

  return {
    operation,
    affectedCount: results.length,
    results,
  };
}

/**
 * Get ticket types with enhanced filtering and pagination
 */
export async function handleGetTicketTypesWithFilters(params: {
  userId: string;
  eventId?: string;
  search?: string;
  isVisible?: boolean;
  priceMin?: number;
  priceMax?: number;
  status?: "active" | "inactive" | "deleted";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
}) {
  const {
    userId,
    eventId,
    search,
    isVisible,
    priceMin,
    priceMax,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 20,
    includeDeleted = false,
  } = params;

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  const offset = (page - 1) * limit;

  // Build where conditions
  const whereConditions: any = {
    event: {
      organizerId: organizer.id,
    },
  };

  // Include/exclude deleted items
  if (!includeDeleted) {
    whereConditions.deletedAt = null;
  }

  if (eventId) {
    whereConditions.eventId = eventId;
  }

  if (search) {
    whereConditions.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (isVisible !== undefined) {
    whereConditions.isVisible = isVisible;
  }

  if (priceMin !== undefined || priceMax !== undefined) {
    whereConditions.price = {};
    if (priceMin !== undefined) whereConditions.price.gte = priceMin;
    if (priceMax !== undefined) whereConditions.price.lte = priceMax;
  }

  if (status) {
    switch (status) {
      case "active":
        whereConditions.isVisible = true;
        whereConditions.deletedAt = null;
        break;
      case "inactive":
        whereConditions.isVisible = false;
        whereConditions.deletedAt = null;
        break;
      case "deleted":
        whereConditions.deletedAt = { not: null };
        break;
    }
  }

  // Build order by
  const orderBy: any = {};
  orderBy[sortBy] = sortOrder;

  // Execute query
  const [ticketTypes, total] = await Promise.all([
    prisma.ticketType.findMany({
      where: whereConditions,
      skip: offset,
      take: limit,
      orderBy,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
        allowedPaymentMethods: {
          include: {
            paymentMethod: true,
          },
        },
        _count: {
          select: {
            tickets: true,
            orderItems: true,
          },
        },
      },
    }),
    prisma.ticketType.count({ where: whereConditions }),
  ]);

  return {
    ticketTypes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
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
