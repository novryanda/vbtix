import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { prisma } from "~/server/db/client";
import { organizerService } from "~/server/services/organizer.service";

/**
 * GET /api/organizer/dashboard
 * Get organizer dashboard statistics and data
 */
export async function GET(_request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Only organizers can access this endpoint
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Get organizer data
    const organizer = await organizerService.findByUserId(session.user.id);

    if (!organizer) {
      return NextResponse.json(
        { success: false, error: "Organizer profile not found" },
        { status: 404 },
      );
    }

    // Get query parameters
    // const searchParams = request.nextUrl.searchParams;
    // Uncomment if you need to use query parameters
    // const period = searchParams.get("period") || "month"; // Default to month

    // Get dashboard statistics
    const [
      totalEvents,
      upcomingEvents,
      totalTicketsSold,
      totalRevenue,
      recentTransactions,
      eventPerformance,
    ] = await Promise.all([
      // Total events
      prisma.event.count({
        where: {
          organizerId: organizer.id,
        },
      }),

      // Upcoming events
      prisma.event.findMany({
        where: {
          organizerId: organizer.id,
          startDate: {
            gte: new Date(),
          },
        },
        orderBy: {
          startDate: "asc",
        },
        take: 5,
      }),

      // Total tickets sold
      prisma.ticket.count({
        where: {
          ticketType: {
            event: {
              organizerId: organizer.id,
            },
          },
        },
      }),

      // Total revenue
      prisma.transaction.aggregate({
        where: {
          event: {
            organizerId: organizer.id,
          },
          status: "SUCCESS",
        },
        _sum: {
          amount: true,
        },
      }),

      // Recent transactions
      prisma.transaction.findMany({
        where: {
          event: {
            organizerId: organizer.id,
          },
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          event: {
            select: {
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      }),

      // Event performance
      prisma.event.findMany({
        where: {
          organizerId: organizer.id,
        },
        include: {
          ticketTypes: {
            include: {
              _count: {
                select: {
                  tickets: true,
                },
              },
            },
          },
          _count: {
            select: {
              transactions: true,
            },
          },
        },
        orderBy: {
          startDate: "desc",
        },
        take: 5,
      }),
    ]);

    // Format the data
    const dashboardData = {
      stats: {
        totalEvents,
        totalTicketsSold,
        totalRevenue: totalRevenue._sum.amount || 0,
        upcomingEventsCount: upcomingEvents.length,
      },
      upcomingEvents,
      recentTransactions,
      eventPerformance: eventPerformance.map((event: any) => ({
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        ticketsSold: event.ticketTypes.reduce(
          (acc: number, type: any) => acc + type._count.tickets,
          0,
        ),
        totalTransactions: event._count.transactions,
      })),
    };

    // Return response
    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Error getting organizer dashboard:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get dashboard data" },
      { status: 500 },
    );
  }
}
