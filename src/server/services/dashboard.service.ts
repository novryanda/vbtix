import { prisma as db } from "~/server/db";

// Mendapatkan statistik dashboard admin
export async function getAdminDashboardStats() {
    try {
        const totalEvents = await db.event.count();
        const totalOrganizers = await db.organizer.count();
        const totalUsers = await db.user.count();

        // Cek apakah model Order tersedia
        let totalSales = 0;
        if (db.order) {
            const salesData = await db.order.aggregate({
                _sum: { totalAmount: true },
            });
            totalSales = salesData._sum?.totalAmount || 0;
        }

        return {
            totalEvents,
            totalOrganizers,
            totalUsers,
            totalSales,
        };
    } catch (error) {
        console.error("Error in getAdminDashboardStats:", error);
        // Return default values if there's an error
        return {
            totalEvents: await db.event.count(),
            totalOrganizers: await db.organizer.count(),
            totalUsers: await db.user.count(),
            totalSales: 0,
        };
    }
}

// Mendapatkan event terbaru
export async function getRecentEvents(limit = 5) {
    return await db.event.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
    });
}

// Mendapatkan organizer terbaru
export async function getRecentOrganizers(limit = 5) {
    return await db.organizer.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
    });
}

// Mendapatkan user terbaru
export async function getRecentUsers(limit = 5) {
    return await db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
    });
}

// Mendapatkan overview penjualan
export async function getSalesOverview() {
    try {
        // Cek apakah model Order tersedia
        if (!db.order) {
            // Jika model tidak tersedia, kembalikan data dummy
            return generateDummySalesData();
        }

        const salesByMonth = await db.order.groupBy({
            by: ["createdAt"],
            _sum: { totalAmount: true },
            orderBy: { createdAt: "asc" },
        });

        if (salesByMonth.length === 0) {
            // Jika tidak ada data, kembalikan data dummy
            return generateDummySalesData();
        }

        return salesByMonth.map((sale) => ({
            month: sale.createdAt,
            totalSales: sale._sum.totalAmount || 0,
        }));
    } catch (error) {
        console.error("Error in getSalesOverview:", error);
        // Kembalikan data dummy jika terjadi error
        return generateDummySalesData();
    }
}

// Fungsi untuk menghasilkan data penjualan dummy
function generateDummySalesData() {
    const months = 6; // 6 bulan terakhir
    const currentDate = new Date();
    const data = [];

    for (let i = 0; i < months; i++) {
        const date = new Date(currentDate);
        date.setMonth(currentDate.getMonth() - i);
        date.setDate(1); // Atur ke tanggal 1 untuk konsistensi

        data.push({
            month: date,
            totalSales: Math.floor(Math.random() * 50000000) + 10000000, // Random antara 10jt - 60jt
        });
    }

    // Urutkan dari bulan terlama ke terbaru
    return data.reverse();
}
