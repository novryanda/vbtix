import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { prisma } from "~/server/db";
import { UserRole } from "@prisma/client";
import { 
  updateWristbandSchema, 
  deleteWristbandSchema,
  updateWristbandStatusSchema 
} from "~/lib/validations/wristband.schema";

/**
 * GET /api/organizer/[organizerId]/wristbands/[wristbandId]
 * Get a specific wristband by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; wristbandId: string }> }
) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only organizers and admins can view wristbands
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id: organizerId, wristbandId } = await params;

    // Verify organizer access
    const organizer = await prisma.organizer.findFirst({
      where: {
        id: organizerId,
        userId: session.user.id,
      },
    });

    if (!organizer) {
      return NextResponse.json(
        {
          success: false,
          error: "Organizer not found or access denied",
        },
        { status: 403 }
      );
    }

    // Get wristband
    const wristband = await prisma.wristbandQRCode.findFirst({
      where: {
        id: wristbandId,
        organizerId,
        deletedAt: null, // Only get non-deleted wristbands
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
          },
        },
        scanLogs: {
          orderBy: { scannedAt: "desc" },
          take: 10, // Get last 10 scans
          include: {
            wristbandQR: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            scanLogs: true,
          },
        },
      },
    });

    if (!wristband) {
      return NextResponse.json(
        { success: false, error: "Wristband not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...wristband,
        totalScans: wristband._count.scanLogs,
      },
    });
  } catch (error) {
    console.error("Error fetching wristband:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/organizer/[organizerId]/wristbands/[wristbandId]
 * Update a wristband
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; wristbandId: string }> }
) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only organizers and admins can update wristbands
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id: organizerId, wristbandId } = await params;
    const body = await request.json();

    try {
      // Validate input using Zod schema
      const validatedData = updateWristbandSchema.parse(body);

      // Verify organizer access
      const organizer = await prisma.organizer.findFirst({
        where: {
          id: organizerId,
          userId: session.user.id,
        },
      });

      if (!organizer) {
        return NextResponse.json(
          {
            success: false,
            error: "Organizer not found or access denied",
          },
          { status: 403 }
        );
      }

      // Check if wristband exists and belongs to organizer
      const existingWristband = await prisma.wristbandQRCode.findFirst({
        where: {
          id: wristbandId,
          organizerId,
          deletedAt: null,
        },
      });

      if (!existingWristband) {
        return NextResponse.json(
          { success: false, error: "Wristband not found" },
          { status: 404 }
        );
      }

      // Prepare update data
      const updateData: any = {
        ...validatedData,
        updatedAt: new Date(),
      };

      // Convert datetime strings to Date objects
      if (validatedData.validFrom) {
        updateData.validFrom = new Date(validatedData.validFrom);
      }
      if (validatedData.validUntil) {
        updateData.validUntil = new Date(validatedData.validUntil);
      }

      // Update wristband
      const updatedWristband = await prisma.wristbandQRCode.update({
        where: { id: wristbandId },
        data: updateData,
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
            },
          },
          _count: {
            select: {
              scanLogs: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Wristband updated successfully",
        data: {
          ...updatedWristband,
          totalScans: updatedWristband._count.scanLogs,
        },
      });
    } catch (validationError: any) {
      // Handle Zod validation errors
      if (validationError.errors) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation error",
            details: validationError.errors,
          },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error: any) {
    console.error("Error updating wristband:", error);

    // Handle specific errors
    if (error.message === "Wristband not found") {
      return NextResponse.json(
        { success: false, error: "Wristband not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update wristband",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizer/[organizerId]/wristbands/[wristbandId]
 * Soft delete a wristband
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; wristbandId: string }> }
) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only organizers and admins can delete wristbands
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id: organizerId, wristbandId } = await params;
    
    // Parse request body for deletion reason
    let reason: string | undefined;
    try {
      const body = await request.json();
      const validatedData = deleteWristbandSchema.parse({ id: wristbandId, ...body });
      reason = validatedData.reason;
    } catch {
      // If no body or invalid body, proceed without reason
    }

    // Verify organizer access
    const organizer = await prisma.organizer.findFirst({
      where: {
        id: organizerId,
        userId: session.user.id,
      },
    });

    if (!organizer) {
      return NextResponse.json(
        {
          success: false,
          error: "Organizer not found or access denied",
        },
        { status: 403 }
      );
    }

    // Check if wristband exists and is not already deleted
    const existingWristband = await prisma.wristbandQRCode.findFirst({
      where: {
        id: wristbandId,
        organizerId,
        deletedAt: null,
      },
    });

    if (!existingWristband) {
      return NextResponse.json(
        { success: false, error: "Wristband not found or already deleted" },
        { status: 404 }
      );
    }

    // Soft delete the wristband
    const deletedWristband = await prisma.wristbandQRCode.update({
      where: { id: wristbandId },
      data: {
        deletedAt: new Date(),
        deletedBy: session.user.id,
        deletionReason: reason,
        status: "REVOKED", // Set status to revoked when deleted
      },
    });

    return NextResponse.json({
      success: true,
      message: "Wristband deleted successfully",
      data: deletedWristband,
    });
  } catch (error: any) {
    console.error("Error deleting wristband:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete wristband",
      },
      { status: 500 }
    );
  }
}
