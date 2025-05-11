import { prisma } from "~/server/db";
import { UserRole, Prisma } from "@prisma/client";

export const userService = {
    // Mencari semua user dengan filter
    async findAll(params: {
        role?: UserRole;
        page?: number;
        limit?: number;
        search?: string;
    }) {
        const { role, page = 1, limit = 10, search } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput = {
            role,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                ],
            }),
        };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.user.count({ where }),
        ]);

        return { users, total };
    },

    // Mencari user berdasarkan ID
    async findById(id: string) {
        return await prisma.user.findUnique({
            where: { id },
        });
    },

    // Membuat user baru
    async createUser(data: Prisma.UserCreateInput) {
        return await prisma.user.create({
            data,
        });
    },

    // Memperbarui user
    async updateUser(id: string, data: Prisma.UserUpdateInput) {
        return await prisma.user.update({
            where: { id },
            data,
        });
    },

    // Menghapus user
    async deleteUser(id: string) {
        return await prisma.user.delete({
            where: { id },
        });
    },

    // Mengubah peran user
    async changeRole(id: string, role: UserRole) {
        return await prisma.user.update({
            where: { id },
            data: { role },
        });
    },
};
