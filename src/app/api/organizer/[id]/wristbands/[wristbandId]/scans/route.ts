import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { prisma } from "~/server/db";
import { z } from "zod";

// Validation schema for route parameters
const paramsSchema = z.object({
  id: z.string().cuid({ message: "Invalid organizer ID format" }),
  wristbandId: z.string().cuid({ message: "Invalid wristband ID format" }),
});

/**
 * GET /api/organizer/[id]/wristbands/[wristbandId]/scans
 * Get scan logs for a specific wristband
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; wristbandId: string }> }
) {
  try {
    const resolvedParams = await params;
    // Validate parameters
    const validatedParams = paramsSchema.safeParse(resolvedParams);
    if (!validatedParams.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
          details: validatedParams.error.format(),
        },
        { status: 400 }
      );
    }

    const { id: organizerId, wristbandId } = validatedParams.data;

    // Get user session and verify organizer access
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Verify organizer access and wristband ownership
    const wristband = await prisma.wristbandQRCode.findFirst({
      where: {
        id: wristbandId,
        organizerId,
        organizer: {
          userId: session.user.id,
        },
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!wristband) {
      return NextResponse.json(
        {
          success: false,
          error: "Wristband not found or access denied",
        },
        { status: 403 }
      );
    }

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Get scan logs with pagination
    const [scanLogs, total] = await Promise.all([
      prisma.wristbandScanLog.findMany({
        where: {
          wristbandQRId: wristbandId,
        },
        orderBy: {
          scannedAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.wristbandScanLog.count({
        where: {
          wristbandQRId: wristbandId,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        wristband: {
          id: wristband.id,
          name: wristband.name,
          description: wristband.description,
          event: wristband.event,
          scanCount: wristband.scanCount,
          maxScans: wristband.maxScans,
        },
        scanLogs: scanLogs.map((log) => ({
          id: log.id,
          scannedAt: log.scannedAt,
          scanResult: log.scanResult,
          scanLocation: log.scanLocation,
          scanDevice: log.scanDevice,
          notes: log.notes,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching wristband scan logs:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
