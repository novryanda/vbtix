import { prisma } from "~/server/db";
import { Prisma, TicketStatus } from "@prisma/client";

export const ticketService = {
  /**
   * Find a ticket by ID
   */
  async findById(id: string) {
    try {
      return await prisma.ticket.findUnique({
        where: { id },
        include: {
          ticketType: {
            include: {
              event: true,
            },
          },
          transaction: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });
    } catch (error) {
      console.error("Error finding ticket by ID:", error);
      throw error;
    }
  },

  /**
   * Find tickets with filtering and pagination
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    status?: TicketStatus;
    eventId?: string;
    ticketTypeId?: string;
    userId?: string;
    search?: string;
  }) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        eventId,
        ticketTypeId,
        userId,
        search,
      } = params;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.TicketWhereInput = {};

      if (status) {
        where.status = status;
      }

      if (eventId) {
        where.ticketType = {
          eventId: {
            equals: eventId,
          },
        };
      }

      if (ticketTypeId) {
        where.ticketTypeId = ticketTypeId;
      }

      if (userId) {
        where.userId = userId;
      }

      if (search) {
        where.OR = [
          { qrCode: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ];
      }

      // Execute query
      const [tickets, total] = await Promise.all([
        prisma.ticket.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            ticketType: {
              include: {
                event: {
                  select: {
                    id: true,
                    title: true,
                    startDate: true,
                    endDate: true,
                  },
                },
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        prisma.ticket.count({ where }),
      ]);

      return { tickets, total };
    } catch (error) {
      console.error("Error finding tickets:", error);
      throw error;
    }
  },

  /**
   * Create a new ticket
   */
  async createTicket(data: Prisma.TicketCreateInput) {
    try {
      return await prisma.ticket.create({
        data,
        include: {
          ticketType: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      console.error("Error creating ticket:", error);
      throw error;
    }
  },

  /**
   * Update a ticket
   */
  async updateTicket(id: string, data: Prisma.TicketUpdateInput) {
    try {
      return await prisma.ticket.update({
        where: { id },
        data,
        include: {
          ticketType: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      console.error("Error updating ticket:", error);
      throw error;
    }
  },

  /**
   * Update ticket status
   */
  async updateTicketStatus(id: string, status: TicketStatus) {
    try {
      return await prisma.ticket.update({
        where: { id },
        data: { status },
      });
    } catch (error) {
      console.error("Error updating ticket status:", error);
      throw error;
    }
  },

  /**
   * Check in a ticket
   */
  async checkInTicket(id: string) {
    try {
      return await prisma.ticket.update({
        where: { id },
        data: {
          checkedIn: true,
          checkInTime: new Date(),
          status: TicketStatus.USED,
        },
      });
    } catch (error) {
      console.error("Error checking in ticket:", error);
      throw error;
    }
  },

  /**
   * Count sold tickets by event ID
   */
  async countSoldTicketsByEventId(eventId: string) {
    try {
      return await prisma.ticket.count({
        where: {
          ticketType: {
            eventId: {
              equals: eventId,
            },
          },
          status: {
            in: [TicketStatus.ACTIVE, TicketStatus.USED],
          },
        },
      });
    } catch (error) {
      console.error("Error counting sold tickets by event ID:", error);
      throw error;
    }
  },

  /**
   * Calculate revenue by event ID
   */
  async calculateRevenueByEventId(eventId: string) {
    try {
      const result = await prisma.orderItem.aggregate({
        where: {
          ticketType: {
            eventId: {
              equals: eventId,
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
    } catch (error) {
      console.error("Error calculating revenue by event ID:", error);
      throw error;
    }
  },

  /**
   * Count sold tickets by organizer ID
   */
  async countSoldTicketsByOrganizerId(organizerId: string) {
    try {
      return await prisma.ticket.count({
        where: {
          ticketType: {
            event: {
              organizerId: {
                equals: organizerId,
              },
            },
          },
          status: {
            in: [TicketStatus.ACTIVE, TicketStatus.USED],
          },
        },
      });
    } catch (error) {
      console.error("Error counting sold tickets by organizer ID:", error);
      throw error;
    }
  },

  /**
   * Calculate revenue by organizer ID
   */
  async calculateRevenueByOrganizerId(organizerId: string) {
    try {
      const result = await prisma.orderItem.aggregate({
        where: {
          ticketType: {
            event: {
              organizerId: {
                equals: organizerId,
              },
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
    } catch (error) {
      console.error("Error calculating revenue by organizer ID:", error);
      throw error;
    }
  },

  /**
   * Get ticket sales statistics by event ID
   */
  async getTicketSaleStatsByEventId(eventId: string) {
    try {
      // Get all ticket types for the event
      const ticketTypes = await prisma.ticketType.findMany({
        where: {
          eventId: {
            equals: eventId,
          },
        },
      });

      // Get sales data for each ticket type
      const salesData = await Promise.all(
        ticketTypes.map(async (ticketType) => {
          const soldCount = await prisma.ticket.count({
            where: {
              ticketTypeId: ticketType.id,
              status: {
                in: [TicketStatus.ACTIVE, TicketStatus.USED],
              },
            },
          });

          return {
            ticketTypeId: ticketType.id,
            name: ticketType.name,
            price: ticketType.price,
            quantity: ticketType.quantity,
            sold: soldCount,
            available: ticketType.quantity - soldCount,
            percentageSold:
              ticketType.quantity > 0
                ? Math.round((soldCount / ticketType.quantity) * 100)
                : 0,
          };
        }),
      );

      return salesData;
    } catch (error) {
      console.error("Error getting ticket sales stats by event ID:", error);
      throw error;
    }
  },
};
