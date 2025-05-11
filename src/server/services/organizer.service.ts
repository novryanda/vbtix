import { prisma } from "~/server/db";
import { Prisma } from "@prisma/client";

export const organizerService = {
  // Mencari semua organizer dengan filter
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    verified?: boolean;
  }) {
    const { page = 1, limit = 10, search, verified } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.OrganizerWhereInput = {
      ...(verified !== undefined && { verified }),
      ...(search && {
        OR: [
          { orgName: { contains: search, mode: "insensitive" } },
          { legalName: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const [organizers, total] = await Promise.all([
      prisma.organizer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          events: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.organizer.count({ where }),
    ]);

    return { organizers, total };
  },

  // Mencari organizer berdasarkan ID
  async findById(id: string) {
    return await prisma.organizer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        bankAccount: true,
      },
    });
  },

  // Mencari organizer berdasarkan ID user
  async findByUserId(userId: string) {
    return await prisma.organizer.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  },

  // Membuat organizer baru
  async createOrganizer(data: Prisma.OrganizerCreateInput) {
    return await prisma.organizer.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  },

  // Memperbarui organizer
  async updateOrganizer(id: string, data: Prisma.OrganizerUpdateInput) {
    return await prisma.organizer.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  },

  // Menghapus organizer
  async deleteOrganizer(id: string) {
    return await prisma.organizer.delete({
      where: { id },
    });
  },

  // Memverifikasi organizer
  async verifyOrganizer(id: string, verified: boolean) {
    return await prisma.organizer.update({
      where: { id },
      data: { verified },
    });
  },

  // Mengupdate informasi bank account
  async updateBankAccount(id: string, bankData: Prisma.BankAccountUpdateInput) {
    const organizer = await prisma.organizer.findUnique({
      where: { id },
      include: { bankAccount: true },
    });

    if (!organizer) {
      throw new Error("Organizer not found");
    }

    if (organizer.bankAccount) {
      return await prisma.bankAccount.update({
        where: { id: organizer.bankAccount.id },
        data: bankData,
      });
    } else {
      return await prisma.bankAccount.create({
        data: {
          ...bankData,
          organizer: { connect: { id } },
        } as Prisma.BankAccountCreateInput,
      });
    }
  },
};
