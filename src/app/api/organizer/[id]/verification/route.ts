import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { organizerService } from "~/server/services/organizer.service";
import { z } from "zod";
import { prisma } from "~/server/db";
import { ApprovalStatus } from "~/lib/constants";

// Validation schema for organizer verification update
const updateVerificationSchema = z.object({
  // KTP Information
  ktpNumber: z.string().min(1, { message: "KTP Number is required" }),
  ktpName: z.string().min(1, { message: "Name as per KTP is required" }),
  ktpAddress: z.string().min(1, { message: "Address as per KTP is required" }),
  ktpImageUrl: z.string().min(1, { message: "KTP Image URL is required" }),
  ktpImagePublicId: z.string().optional(),

  // NPWP Information (optional)
  npwpNumber: z.string().optional(),
  npwpName: z.string().optional(),
  npwpAddress: z.string().optional(),
  npwpImageUrl: z.string().optional(),
  npwpImagePublicId: z.string().optional(),

  // Terms and Conditions
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),

  // Additional notes
  notes: z.string().optional(),
});

/**
 * PUT /api/organizer/[id]/verification
 * Update verification documents for an organizer
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
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

    const organizerId = (await params).id;

    // Check if user has ORGANIZER role
    const user = await prisma.user.findUnique({
      where: { id: organizerId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    if (user.role !== UserRole.ORGANIZER) {
      return NextResponse.json(
        { success: false, error: "User is not an organizer" },
        { status: 403 },
      );
    }

    // Check if user is the owner or admin
    if (user.id !== session.user.id && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Try to find existing organizer record (may not exist yet)
    let organizer = await organizerService.findByUserId(organizerId);

    // If organizer record doesn't exist yet, we'll handle verification for the user
    // The organizer record will be created when admin approves the verification

    // Parse and validate the request body
    const body = await request.json();
    try {
      console.log("Validation input:", body);

      // Try to parse the data with the schema
      let validationResult;
      try {
        validationResult = updateVerificationSchema.safeParse(body);
        if (!validationResult.success) {
          console.error("Validation error:", validationResult.error);
          return NextResponse.json(
            {
              success: false,
              error: "Validation error",
              details: validationResult.error.format(),
            },
            { status: 400 },
          );
        }
      } catch (err) {
        console.error("Error during schema validation:", err);
        return NextResponse.json(
          {
            success: false,
            error: "Error during validation",
            details: err,
          },
          { status: 400 },
        );
      }

      const verificationData = validationResult.data;
      const { notes, ...verificationFields } = verificationData;

      // If no organizer record exists, create a verification request for the user
      if (!organizer) {
        // Check if there's already a pending verification for this user
        const existingUserApproval = await prisma.approval.findFirst({
          where: {
            entityType: "USER_ORGANIZER_VERIFICATION",
            entityId: user.id,
            status: "PENDING",
          },
        });

        if (existingUserApproval) {
          return NextResponse.json(
            {
              success: false,
              error:
                "You already have a pending verification request. Please wait for admin response.",
            },
            { status: 400 },
          );
        }

        // Create approval record for user verification
        // Store verification data in notes as JSON
        const verificationNotes = {
          userNotes: notes || "Initial organizer verification request",
          verificationData: verificationFields,
        };

        await prisma.approval.create({
          data: {
            entityType: "USER_ORGANIZER_VERIFICATION",
            entityId: user.id,
            status: ApprovalStatus.PENDING,
            notes: JSON.stringify(verificationNotes),
            submitterId: session.user.id,
            submittedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message:
            "Verification request submitted successfully. Please wait for admin approval.",
          data: {
            userId: user.id,
            status: "PENDING",
          },
        });
      }

      // If organizer record exists, handle normal verification flow
      let verification = await prisma.organizerVerification.findUnique({
        where: { organizerId: organizer.id },
      });

      // Check if there's a pending approval
      const pendingApproval = await prisma.approval.findFirst({
        where: {
          entityType: "ORGANIZER",
          entityId: organizer.id,
          status: "PENDING",
        },
        orderBy: {
          submittedAt: "desc",
        },
      });

      console.log("Verification submission check:", {
        verificationStatus: verification?.status,
        pendingApprovalStatus: pendingApproval?.status,
        organizerId: organizer.id,
      });

      // Special case: If verification is REJECTED, allow resubmission regardless of approvals
      if (verification && verification.status === "REJECTED") {
        console.log("Allowing resubmission because verification is REJECTED");

        // Clean up any stale pending approvals
        if (pendingApproval) {
          console.log(
            `Cleaning up stale pending approval ${pendingApproval.id}`,
          );
          try {
            await prisma.approval.update({
              where: { id: pendingApproval.id },
              data: {
                status: "REJECTED",
                notes:
                  "Automatically rejected due to resubmission after rejection",
                reviewedAt: new Date(),
              },
            });
          } catch (err) {
            console.error("Error cleaning up stale approval:", err);
          }
        }
      }
      // Otherwise, check if there's a pending verification request
      // Only block resubmission if there's a pending approval with status "PENDING"
      else if (
        (verification && verification.status === "PENDING") ||
        (pendingApproval && pendingApproval.status === "PENDING")
      ) {
        console.log("Blocking verification submission due to pending request");
        return NextResponse.json(
          {
            success: false,
            error:
              "You already have a pending verification request. Please wait for admin response before submitting another request.",
          },
          { status: 400 },
        );
      }

      // Create or update the verification record
      if (verification) {
        // Update existing verification record
        verification = await prisma.organizerVerification.update({
          where: { organizerId: organizer.id },
          data: {
            ...verificationFields,
            status: "PENDING",
            submittedAt: new Date(),
            termsAcceptedAt: new Date(),
          },
        });
      } else {
        // Create new verification record
        verification = await prisma.organizerVerification.create({
          data: {
            ...verificationFields,
            organizerId: organizer.id,
            status: "PENDING",
            submittedAt: new Date(),
            termsAcceptedAt: new Date(),
          },
        });
      }

      // Update the organizer's verification status
      const updatedOrganizer = await organizerService.updateOrganizer(
        organizer.id,
        {
          verified: false, // Reset verification status when new verification is submitted
        },
      );

      // Create a verification request record
      await prisma.approval.create({
        data: {
          entityType: "ORGANIZER",
          entityId: organizer.id,
          status: ApprovalStatus.PENDING,
          notes: notes || "Verification information submitted by organizer",
          submitterId: session.user.id,
          submittedAt: new Date(),
        },
      });

      // Return the updated verification data
      return NextResponse.json({
        success: true,
        data: {
          id: updatedOrganizer.id,
          verified: updatedOrganizer.verified,
          verification,
        },
      });
    } catch (validationError: any) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: validationError.errors || validationError,
        },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error("Error updating verification documents:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update verification documents",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/organizer/[id]/verification
 * Get verification status for an organizer
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
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

    const organizerId = (await params).id;

    // Check if user has ORGANIZER role
    const user = await prisma.user.findUnique({
      where: { id: organizerId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    if (user.role !== UserRole.ORGANIZER) {
      return NextResponse.json(
        { success: false, error: "User is not an organizer" },
        { status: 403 },
      );
    }

    // Check if user is the owner or admin
    if (user.id !== session.user.id && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Try to find existing organizer record (may not exist yet)
    let organizer = await organizerService.findByUserId(organizerId);

    // If no organizer record exists, check for user verification requests
    if (!organizer) {
      const userApproval = await prisma.approval.findFirst({
        where: {
          entityType: "USER_ORGANIZER_VERIFICATION",
          entityId: user.id,
        },
        orderBy: {
          submittedAt: "desc",
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          userId: user.id,
          verified: false,
          verification: null,
          hasPendingRequest: userApproval?.status === "PENDING",
          approval: userApproval
            ? {
                status: userApproval.status,
                notes: userApproval.notes,
                submittedAt: userApproval.submittedAt,
                reviewedAt: userApproval.reviewedAt,
              }
            : null,
        },
      });
    }

    // Get the verification data
    const verification = await prisma.organizerVerification.findUnique({
      where: { organizerId: organizer.id },
    });

    // Get the latest verification request
    const latestApproval = await prisma.approval.findFirst({
      where: {
        entityType: "ORGANIZER",
        entityId: organizer.id,
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    // Get all approvals for debugging
    const allApprovals = await prisma.approval.findMany({
      where: {
        entityType: "ORGANIZER",
        entityId: organizer.id,
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    console.log(
      "GET - All approvals:",
      allApprovals.map((a) => ({
        id: a.id,
        status: a.status,
        submittedAt: a.submittedAt,
        reviewedAt: a.reviewedAt,
      })),
    );

    // Special case: If verification is REJECTED, clean up any stale pending approvals
    if (
      verification &&
      verification.status === "REJECTED" &&
      latestApproval &&
      latestApproval.status === "PENDING"
    ) {
      console.log(
        `GET - Cleaning up stale pending approval ${latestApproval.id}`,
      );
      try {
        await prisma.approval.update({
          where: { id: latestApproval.id },
          data: {
            status: "REJECTED",
            notes:
              "Automatically rejected due to verification being in REJECTED state",
            reviewedAt: new Date(),
          },
        });

        // Refresh the latestApproval after update
        const updatedApproval = await prisma.approval.findUnique({
          where: { id: latestApproval.id },
        });

        if (updatedApproval) {
          console.log(
            `GET - Updated approval status to ${updatedApproval.status}`,
          );
        }
      } catch (err) {
        console.error("GET - Error cleaning up stale approval:", err);
      }
    }

    // Check if there's a pending approval
    // Only consider it pending if the status is actually "PENDING"
    // AND the verification is not REJECTED (special case to allow resubmission)
    const hasPendingRequest =
      latestApproval &&
      latestApproval.status === "PENDING" &&
      (!verification || verification.status !== "REJECTED");

    // If there's a pending approval but no verification record or verification is not pending,
    // we need to ensure the client knows there's a pending request
    let verificationToReturn = verification;

    // We'll use hasPendingRequest flag instead of modifying the verification object
    // This avoids TypeScript errors with the Prisma model

    // Log verification status for debugging
    console.log("Verification status:", {
      organizerId: organizer.id,
      verified: organizer.verified,
      verificationStatus: verification?.status,
      latestApprovalStatus: latestApproval?.status,
      hasPendingRequest,
    });

    // Return the verification status
    return NextResponse.json({
      success: true,
      data: {
        id: organizer.id,
        verified: organizer.verified,
        verification: verificationToReturn,
        hasPendingRequest,
        approval: latestApproval
          ? {
              status: latestApproval.status,
              notes: latestApproval.notes,
              submittedAt: latestApproval.submittedAt,
              reviewedAt: latestApproval.reviewedAt,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error("Error getting verification status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get verification status",
      },
      { status: 500 },
    );
  }
}
