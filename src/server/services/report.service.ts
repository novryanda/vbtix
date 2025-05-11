import { prisma } from "~/server/db";
import { UserRole, EventStatus } from "@prisma/client";

export const reportService = {
    // Menghasilkan laporan penjualan
    async generateSalesReport(params: {
        startDate?: Date;
        endDate?: Date;
        eventId?: string;
    }) {
        const { startDate, endDate, eventId } = params;

        const where = {
            ...(startDate && { createdAt: { gte: startDate } }),
            ...(endDate && { createdAt: { lte: endDate } }),
            ...(eventId && { eventId }),
        };

        const sales = await prisma.transaction.groupBy({
            by: ["eventId"],
            _sum: { amount: true },
            where,
        });

        return sales.map((sale) => ({
            eventId: sale.eventId,
            totalSales: sale._sum.amount || 0,
        }));
    },

    // Menghasilkan laporan user
    async generateUserReport(params: {
        startDate?: Date;
        endDate?: Date;
        role?: UserRole;
    }) {
        const { startDate, endDate, role } = params;

        const where = {
            ...(startDate && { createdAt: { gte: startDate } }),
            ...(endDate && { createdAt: { lte: endDate } }),
            ...(role && { role }),
        };

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        return users;
    },

    // Menghasilkan laporan event
    async generateEventReport(params: {
        startDate?: Date;
        endDate?: Date;
        status?: EventStatus;
    }) {
        const { startDate, endDate, status } = params;

        const where = {
            ...(startDate && { startDate: { gte: startDate } }),
            ...(endDate && { endDate: { lte: endDate } }),
            ...(status && { status }),
        };

        const events = await prisma.event.findMany({
            where,
            select: {
                id: true,
                title: true,
                status: true,
                startDate: true,
                endDate: true,
                organizer: {
                    select: {
                        orgName: true,
                    },
                },
            },
        });

        return events.map((event) => ({
            id: event.id,
            title: event.title,
            status: event.status,
            startDate: event.startDate,
            endDate: event.endDate,
            organizerName: event.organizer.orgName,
        }));
    },
};
