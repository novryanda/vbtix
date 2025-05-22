import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { prisma } from "~/server/db";

/**
 * GET /api/admin/verifications
 * Get all user organizer verification requests
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Only admins can access this endpoint
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build where clause
    const where: any = {
      entityType: "USER_ORGANIZER_VERIFICATION",
    };

    if (status) {
      where.status = status;
    }

    // Fetch verification requests
    const requests = await prisma.approval.findMany({
      where,
      orderBy: {
        submittedAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get total count for pagination
    const total = await prisma.approval.count({ where });

    // Transform the data to include user information from entityId
    const transformedRequests = await Promise.all(
      requests.map(async (request) => {
        // Fetch user data based on entityId
        let user = null;
        if (request.entityId) {
          user = await prisma.user.findUnique({
            where: { id: request.entityId },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          });
        }

        return {
          id: request.id,
          entityId: request.entityId,
          status: request.status,
          notes: request.notes,
          submittedAt: request.submittedAt,
          reviewedAt: request.reviewedAt,
          submitterId: request.submitterId,
          reviewerId: request.reviewerId,
          user,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      data: transformedRequests,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching verification requests:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch verification requests",
      },
      { status: 500 },
    );
  }
}
