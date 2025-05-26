import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { prisma } from "~/server/db";
import { formatDate } from "~/lib/utils";

/**
 * GET /api/admin/organizers/[organizerId]/verification-history
 * Get verification history for an organizer
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ organizerId: string }> },
) {
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

    const { organizerId } = await params;

    // Get all approvals for this organizer
    const approvals = await prisma.approval.findMany({
      where: {
        entityType: "ORGANIZER",
        entityId: organizerId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get user information for submitters and reviewers
    const userIds = [
      ...new Set([
        ...approvals
          .map((a) => a.submitterId)
          .filter((id): id is string => id !== null),
        ...approvals
          .map((a) => a.reviewerId)
          .filter((id): id is string => id !== null),
      ]),
    ];

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    // Map users to a dictionary for easy lookup
    const userMap = users.reduce(
      (acc, user) => {
        acc[user.id] = user;
        return acc;
      },
      {} as Record<string, (typeof users)[number]>,
    );

    // Format the approvals with user information
    const formattedApprovals = approvals.map((approval) => ({
      id: approval.id,
      status: approval.status,
      notes: approval.notes,
      createdAt: approval.createdAt,
      formattedCreatedAt: formatDate(approval.createdAt),
      submittedAt: approval.submittedAt,
      formattedSubmittedAt: approval.submittedAt
        ? formatDate(approval.submittedAt)
        : null,
      reviewedAt: approval.reviewedAt,
      formattedReviewedAt: approval.reviewedAt
        ? formatDate(approval.reviewedAt)
        : null,
      submitter: approval.submitterId ? userMap[approval.submitterId] : null,
      reviewer: approval.reviewerId ? userMap[approval.reviewerId] : null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedApprovals,
    });
  } catch (error: any) {
    const { organizerId } = await params;
    console.error(
      `Error getting verification history for organizer ${organizerId}:`,
      error,
    );
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get verification history",
      },
      { status: 500 },
    );
  }
}
