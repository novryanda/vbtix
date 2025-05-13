// src/server/services/user.service.ts
import { prisma } from "~/server/db";
import { Prisma, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

export const userService = {
    /**
     * Mencari semua user dengan filter dan pagination
     */
    async findAll(params: {
        page?: number;
        limit?: number;
        role?: UserRole;
        search?: string;
        isActive?: boolean;
    }) {
        const { page = 1, limit = 10, role, search, isActive } = params;
        const skip = (page - 1) * limit;

        try {
            console.log("findAll params:", { page, limit, role, search, isActive });

            const where: Prisma.UserWhereInput = {};

            if (role) {
                where.role = role;
            }

            if (search) {
                where.OR = [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                ];
            }

            if (isActive !== undefined) {
                console.log("Filtering by isActive:", isActive);
                // Mengasumsikan kolom/field isActive tersedia atau logika untuk menentukan user aktif
                // Jika tidak ada isActive field, bisa disesuaikan dengan logika yang sesuai
                // Misalnya, jika user aktif = emailVerified tidak null
                if (isActive === true) {
                    where.emailVerified = { not: null };
                } else if (isActive === false) {
                    where.emailVerified = null;
                }
                // Jika isActive undefined, tidak perlu filter
            }

            console.log("Query where condition:", JSON.stringify(where, null, 2));

            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        emailVerified: true,
                        image: true,
                        phone: true,
                        role: true,
                        createdAt: true,
                        updatedAt: true,
                        // Tidak memilih password untuk keamanan
                        // Tambahkan relasi jika diperlukan
                        organizer: {
                            select: {
                                id: true,
                                orgName: true,
                                verified: true
                            }
                        }
                    },
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.user.count({ where })
            ]);

            console.log(`Database returned ${users.length} users out of ${total} total`);

            return { users, total };
        } catch (error) {
            console.error("Database error:", error);
            throw error;
        }
    },

    /**
     * Mencari user berdasarkan ID
     */
    async findById(id: string) {
        try {
            return await prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    emailVerified: true,
                    image: true,
                    phone: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                    // Tidak memilih password untuk keamanan
                    organizer: {
                        select: {
                            id: true,
                            orgName: true,
                            verified: true
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
     * Membuat user baru
     */
    async createUser(data: {
        name?: string;
        email: string;
        password: string;
        phone?: string;
        role?: UserRole;
    }) {
        try {
            // Hash password
            const hashedPassword = await hash(data.password, 12);

            return await prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    password: hashedPassword,
                    phone: data.phone,
                    role: data.role || UserRole.BUYER,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                    createdAt: true
                }
            });
        } catch (error) {
            console.error("Database error:", error);
            throw error;
        }
    },

    /**
     * Memperbarui data user
     */
    async updateUser(id: string, data: {
        name?: string;
        email?: string;
        phone?: string;
        image?: string;
    }) {
        try {
            return await prisma.user.update({
                where: { id },
                data,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    emailVerified: true,
                    image: true,
                    phone: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
        } catch (error) {
            console.error("Database error:", error);
            throw error;
        }
    },

    /**
     * Menghapus user
     */
    async deleteUser(id: string) {
        try {
            return await prisma.user.delete({
                where: { id }
            });
        } catch (error) {
            console.error("Database error:", error);
            throw error;
        }
    },

    /**
     * Mengubah role user
     */
    async changeRole(id: string, role: UserRole) {
        try {
            return await prisma.user.update({
                where: { id },
                data: { role },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                }
            });
        } catch (error) {
            console.error("Database error:", error);
            throw error;
        }
    },

    /**
     * Mengatur status aktif/nonaktif
     * (Mengasumsikan emailVerified sebagai indikator status aktif)
     */
    async setActive(id: string, isActive: boolean) {
        try {
            return await prisma.user.update({
                where: { id },
                data: {
                    emailVerified: isActive ? new Date() : null
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    emailVerified: true,
                    role: true
                }
            });
        } catch (error) {
            console.error("Database error:", error);
            throw error;
        }
    },

    /**
     * Me-reset password user
     */
    async resetPassword(id: string, newPassword: string) {
        try {
            // Hash password baru
            const hashedPassword = await hash(newPassword, 12);

            return await prisma.user.update({
                where: { id },
                data: { password: hashedPassword },
                select: {
                    id: true,
                    email: true,
                    updatedAt: true
                }
            });
        } catch (error) {
            console.error("Database error:", error);
            throw error;
        }
    },

    /**
     * Mencari user berdasarkan email
     */
    async findByEmail(email: string) {
        try {
            return await prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    emailVerified: true,
                    role: true
                }
            });
        } catch (error) {
            console.error("Database error:", error);
            throw error;
        }
    },

    /**
     * Memeriksa apakah email sudah digunakan
     */
    async isEmailTaken(email: string, excludeUserId?: string) {
        try {
            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) return false;
            if (excludeUserId && user.id === excludeUserId) return false;

            return true;
        } catch (error) {
            console.error("Database error:", error);
            throw error;
        }
    }
};