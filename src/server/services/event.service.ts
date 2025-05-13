import { prisma as db } from "~/server/db";
import { EventStatus, Prisma } from "@prisma/client";
import { CreateEventSchema, UpdateEventSchema } from "~/lib/validations/event.schema";
import { createSlug } from "~/lib/utils";

export const eventService = {
  /**
   * Mencari event berdasarkan ID
   */
  async findById(id: string) {
    try {
      return await db.event.findUnique({
        where: { id },
        include: { organizer: true }
      });
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  /**
   * Mencari semua event dengan filter dan pagination
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    status?: EventStatus;
    organizerId?: string;
    search?: string;
    featured?: boolean;
    published?: boolean;
  }) {
    const { page = 1, limit = 10, status, organizerId, search, featured, published } = params;
    const skip = (page - 1) * limit;

    try {
      console.log("Finding events with params:", params);

      const where: Prisma.EventWhereInput = {};

      if (status) {
        where.status = status;
      }

      if (organizerId) {
        where.organizerId = organizerId;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { venue: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
        ];
      }

      if (featured !== undefined) {
        where.featured = featured;
      }

      if (published !== undefined) {
        where.published = published;
      }

      // For buyer-facing endpoints, only show published events
      if (published === undefined && status === undefined) {
        // If neither published nor status filter is specified, default to published events
        where.published = true;
        where.status = EventStatus.PUBLISHED;
      }

      console.log("Query where condition:", JSON.stringify(where, null, 2));

      const [events, total] = await Promise.all([
        db.event.findMany({
          where,
          skip,
          take: limit,
          orderBy: { startDate: 'asc' },
          include: {
            organizer: {
              select: {
                id: true,
                orgName: true,
                verified: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                  }
                }
              }
            },
            ticketTypes: {
              select: {
                id: true,
                name: true,
                price: true,
                quantity: true,
                sold: true
              }
            },
            _count: {
              select: {
                ticketTypes: true,
                transactions: true
              }
            }
          }
        }),
        db.event.count({ where })
      ]);

      console.log(`Found ${events.length} events out of ${total} total`);

      return { events, total };
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  /**
   * Membuat event baru
   */
  async createEvent(data: CreateEventSchema, organizerId: string) {
    try {
      // Generate slug if not provided
      const slug = data.slug || createSlug(data.title);

      // Check if slug already exists
      const existingEvent = await db.event.findUnique({
        where: { slug }
      });

      if (existingEvent) {
        // If slug exists, append a random string
        const randomString = Math.random().toString(36).substring(2, 7);
        data.slug = `${slug}-${randomString}`;
      } else {
        data.slug = slug;
      }

      // Create event
      return await db.event.create({
        data: {
          ...data,
          organizerId,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
        },
        include: {
          organizer: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  /**
   * Memperbarui event
   */
  async updateEvent(id: string, data: UpdateEventSchema) {
    try {
      // If slug is being updated, check if it already exists
      if (data.slug) {
        const existingEvent = await db.event.findFirst({
          where: {
            slug: data.slug,
            id: { not: id }
          }
        });

        if (existingEvent) {
          // If slug exists, append a random string
          const randomString = Math.random().toString(36).substring(2, 7);
          data.slug = `${data.slug}-${randomString}`;
        }
      }

      // Convert date strings to Date objects if provided
      const updateData: any = { ...data };
      if (data.startDate) {
        updateData.startDate = new Date(data.startDate);
      }
      if (data.endDate) {
        updateData.endDate = new Date(data.endDate);
      }

      return await db.event.update({
        where: { id },
        data: updateData,
        include: {
          organizer: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true
                }
              }
            }
          },
          ticketTypes: true
        }
      });
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  /**
   * Menghapus event
   */
  async deleteEvent(id: string) {
    try {
      return await db.event.delete({
        where: { id },
      });
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  /**
   * Mengatur event sebagai featured
   */
  async setFeatured(id: string, featured: boolean) {
    try {
      return await db.event.update({
        where: { id },
        data: { featured },
      });
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  /**
   * Mendapatkan statistik event
   */
  async getStatistics(id: string) {
    try {
      const totalTickets = await db.ticket.count({
        where: { eventId: id },
      });

      const totalSales = await db.order.aggregate({
        _sum: { totalAmount: true },
        where: { eventId: id },
      });

      return {
        totalTickets,
        totalSales: totalSales._sum.totalAmount || 0,
      };
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  /**
   * Menyetujui atau menolak event
   */
  async reviewEvent(id: string, status: EventStatus, notes?: string) {
    try {
      // Update event status
      const event = await db.event.update({
        where: { id },
        data: {
          status,
          published: status === EventStatus.PUBLISHED,
        },
      });

      // Create approval record
      await db.approval.create({
        data: {
          entityType: 'EVENT',
          entityId: id,
          status: status === EventStatus.PUBLISHED ? 'APPROVED' : 'REJECTED',
          notes,
          reviewedAt: new Date()
        }
      });

      return event;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  /**
   * Submit event for review
   */
  async submitForReview(id: string) {
    try {
      return await db.event.update({
        where: { id },
        data: {
          status: EventStatus.PENDING_REVIEW,
        },
      });
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  /**
   * Find events by organizer user ID
   */
  async findByOrganizerUserId(userId: string, params: {
    page?: number;
    limit?: number;
    status?: EventStatus;
    search?: string;
  }) {
    try {
      // Find organizer by user ID
      const organizer = await db.organizer.findUnique({
        where: { userId }
      });

      if (!organizer) {
        throw new Error("Organizer not found");
      }

      // Find events by organizer ID
      return this.findAll({
        ...params,
        organizerId: organizer.id
      });
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  /**
   * Get event statistics
   */
  async getEventStatistics(id: string) {
    try {
      const event = await db.event.findUnique({
        where: { id },
        include: {
          ticketTypes: {
            select: {
              id: true,
              name: true,
              price: true,
              quantity: true,
              sold: true,
              _count: {
                select: {
                  orderItems: true
                }
              }
            }
          },
          transactions: {
            where: {
              status: 'SUCCESS'
            },
            select: {
              id: true,
              amount: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              transactions: true
            }
          }
        }
      });

      if (!event) {
        throw new Error("Event not found");
      }

      // Calculate total tickets sold
      const totalTicketsSold = event.ticketTypes.reduce((acc, type) => acc + type.sold, 0);

      // Calculate total capacity
      const totalCapacity = event.ticketTypes.reduce((acc, type) => acc + type.quantity, 0);

      // Calculate total revenue
      const totalRevenue = event.transactions.reduce((acc, tx) => acc + Number(tx.amount), 0);

      return {
        event,
        stats: {
          totalTicketsSold,
          totalCapacity,
          totalRevenue,
          soldPercentage: totalCapacity > 0 ? (totalTicketsSold / totalCapacity) * 100 : 0,
          totalTransactions: event._count.transactions
        }
      };
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  }
};
