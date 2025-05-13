import { NextRequest, NextResponse } from "next/server";
import { handleVerifyOrganizer } from "~/server/api/admin-organizers";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { z } from "zod";

const verifySchema = z.object({
  verified: z.boolean(),
  notes: z.string().optional(),
});

/**
 * PUT /api/admin/organizers/[organizersId]/verify
 * Verify or reject an organizer
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { organizersId: string } },
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

    // Only admins can verify organizers
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { organizersId } = params;
    const body = await request.json();

    try {
      // Validate input
      const { verified, notes } = verifySchema.parse(body);

      // Update verification status
      const result = await handleVerifyOrganizer(
        organizersId,
        verified,
        notes,
        session.user.id,
      );

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (validationError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: validationError },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error(`Error verifying organizer ${params.organizersId}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to verify organizer",
      },
      { status: error.message === "Organizer not found" ? 404 : 500 },
    );
  }
}
