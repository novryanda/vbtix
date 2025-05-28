import { prisma as db } from "~/server/db";
import { Prisma, PaymentStatus } from "@prisma/client";

export const orderService = {
  // Mencari semua order dengan filter
  async findAll(params: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {
      ...(search && {
        OR: [
          { id: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { event: { title: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const [orders, total] = await Promise.all([
      db.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
          event: true,
        },
      }),
      db.transaction.count({ where }),
    ]);

    return { orders, total };
  },

  // Mencari order berdasarkan ID
  async findById(id: string) {
    return await db.transaction.findUnique({
      where: { id },
      include: {
        user: true,
        event: true,
        orderItems: {
          include: {
            ticketType: true,
          },
        },
      },
    });
  },

  // Mengubah status order
  async updateStatus(id: string, status: PaymentStatus) {
    return await db.transaction.update({
      where: { id },
      data: { status },
    });
  },
};
