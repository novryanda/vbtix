import { prisma as db } from "~/server/db";
import { EventStatus, ApprovalStatus, Prisma } from "@prisma/client";

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
  }) {
    const { page = 1, limit = 10, status, organizerId, search } = params;
    const skip = (page - 1) * limit;
    
    try {
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
        ];
      }
      
      const [events, total] = await Promise.all([
        db.event.findMany({
          where,
          skip,
          take: limit,
          orderBy: { startDate: 'asc' },
          include: { organizer: true }
        }),
        db.event.count({ where })
      ]);
      
      return { events, total };
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  /**
   * Membuat event baru
   */
  async createEvent(data: Prisma.EventCreateInput) {
    try {
      return await db.event.create({
        data,
        include: { organizer: true }
      });
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  /**
   * Memperbarui event
   */
  async updateEvent(id: string, data: Prisma.EventUpdateInput) {
    try {
      return await db.event.update({
        where: { id },
        data,
        include: { organizer: true }
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
  async reviewEvent(id: string, status: ApprovalStatus, feedback?: string) {
    try {
      return await db.event.update({
        where: { id },
        data: {
          approvalStatus: status,
          feedback,
        },
      });
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },
};
