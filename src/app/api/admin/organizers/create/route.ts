import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { organizerService } from "~/server/services/organizer.service";
import { z } from "zod";

const createOrganizerSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  orgName: z.string().min(1, "Organization name is required"),
});

/**
 * POST /api/admin/organizers/create
 * Create organizer record for existing user
 */
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const result = createOrganizerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: result.error.errors,
        },
        { status: 400 },
      );
    }

    const { userId, orgName } = result.data;

    // Create organizer record
    const organizer = await organizerService.createOrganizerForUser(
      userId,
      orgName,
    );

    return NextResponse.json({
      success: true,
      data: organizer,
      message: "Organizer record created successfully",
    });
  } catch (error: any) {
    console.error("Error creating organizer record:", error);

    // Handle specific errors
    if (error.message === "User not found") {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    if (error.message === "User is not an organizer") {
      return NextResponse.json(
        { success: false, error: "User does not have organizer role" },
        { status: 400 },
      );
    }

    if (error.message === "Organizer record already exists for this user") {
      return NextResponse.json(
        { success: false, error: "Organizer record already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to create organizer record" },
      { status: 500 },
    );
  }
}
