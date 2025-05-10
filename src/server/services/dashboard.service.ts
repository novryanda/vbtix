import { prisma } from '~/server/db'; // Assuming Prisma is used for database access

export async function getAdminDashboardStats() {
    const totalUsers = await prisma.user.count();
    const totalEvents = await prisma.event.count();
    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
        _sum: { totalAmount: true },
    });

    return {
        totalUsers,
        totalEvents,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
    };
}

export async function getRecentEvents(limit = 5) {
    return await prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
}

export async function getRecentOrganizers(limit = 5) {
    return await prisma.organizer.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
}

export async function getRecentUsers(limit = 5) {
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
}

export async function getSalesOverview() {
    const salesData = await prisma.order.groupBy({
        by: ['createdAt'],
        _sum: { totalAmount: true },
    });

    return salesData.map(sale => ({
        date: sale.createdAt,
        totalSales: sale._sum.totalAmount || 0,
    }));
}
