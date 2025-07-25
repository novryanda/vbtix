import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { createWristbandQRCode } from "~/server/services/wristband-qr.service";
import { createWristbandWithBarcode } from "~/server/services/wristband-barcode.service";
import { prisma } from "~/server/db";
import { z } from "zod";
import {
  createWristbandSchema,
  wristbandFilterSchema,
  bulkWristbandOperationSchema
} from "~/lib/validations/wristband.schema";
import { UserRole } from "@prisma/client";

// Legacy validation schema - now using imported schema
// Keeping for backward compatibility if needed

// Validation schema for route parameters
const paramsSchema = z.object({
  id: z.string().cuid({ message: "Invalid organizer ID format" }),
});

/**
 * GET /api/organizer/[id]/wristbands
 * Get all wristbands for an organizer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    // Validate parameters
    const validatedParams = paramsSchema.safeParse(resolvedParams);
    if (!validatedParams.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid organizer ID",
          details: validatedParams.error.format(),
        },
        { status: 400 }
      );
    }

    const { id: organizerId } = validatedParams.data;

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

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {
      organizerId,
    };

    if (eventId) {
      where.eventId = eventId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const offset = (page - 1) * limit;

    // Get wristbands with pagination
    const [wristbands, total] = await Promise.all([
      prisma.wristbandQRCode.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
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
      }),
      prisma.wristbandQRCode.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        wristbands: wristbands.map((wristband) => ({
          id: wristband.id,
          name: wristband.name,
          description: wristband.description,
          status: wristband.status,
          // QR Code fields
          qrCodeImageUrl: wristband.qrCodeImageUrl,
          qrCodeData: wristband.qrCodeData,
          qrCodeGeneratedAt: wristband.qrCodeGeneratedAt,
          // Barcode fields
          barcodeType: wristband.barcodeType,
          barcodeValue: wristband.barcodeValue,
          barcodeImageUrl: wristband.barcodeImageUrl,
          barcodeData: wristband.barcodeData,
          barcodeGeneratedAt: wristband.barcodeGeneratedAt,
          codeType: wristband.codeType,
          // Other fields
          scanCount: wristband.scanCount,
          maxScans: wristband.maxScans,
          isReusable: wristband.isReusable,
          validFrom: wristband.validFrom,
          validUntil: wristband.validUntil,
          createdAt: wristband.createdAt,
          event: wristband.event,
          totalScans: wristband._count.scanLogs,
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
    console.error("Error fetching wristbands:", error);
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
 * POST /api/organizer/[id]/wristbands
 * Create a new wristband QR code
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    // Validate parameters
    const validatedParams = paramsSchema.safeParse(resolvedParams);
    if (!validatedParams.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid organizer ID",
          details: validatedParams.error.format(),
        },
        { status: 400 }
      );
    }

    const { id: organizerId } = validatedParams.data;

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

    // Parse request body
    const body = await request.json();
    const validatedData = createWristbandSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: validatedData.error.format(),
        },
        { status: 400 }
      );
    }

    const { eventId, name, description, validFrom, validUntil, maxScans, codeType } = validatedData.data;

    // Create wristband based on code type
    const result = codeType === "BARCODE"
      ? await createWristbandWithBarcode({
          eventId,
          organizerId,
          name,
          description,
          validFrom: validFrom ? new Date(validFrom) : undefined,
          validUntil: validUntil ? new Date(validUntil) : undefined,
          maxScans,
          createdBy: session.user.id,
        })
      : await createWristbandQRCode({
          eventId,
          organizerId,
          name,
          description,
          validFrom: validFrom ? new Date(validFrom) : undefined,
          validUntil: validUntil ? new Date(validUntil) : undefined,
          maxScans,
          createdBy: session.user.id,
        });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.wristband,
    });
  } catch (error) {
    console.error("Error creating wristband:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
