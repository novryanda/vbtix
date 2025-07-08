import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { prisma } from "~/server/db";
import { UserRole, WristbandQRCodeStatus } from "@prisma/client";
import { 
  bulkWristbandOperationSchema,
  wristbandFilterSchema 
} from "~/lib/validations/wristband.schema";

/**
 * POST /api/organizer/[organizerId]/wristbands/bulk
 * Perform bulk operations on wristbands
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Only organizers and admins can perform bulk operations
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id: organizerId } = await params;
    const body = await request.json();

    try {
      // Validate input using Zod schema
      const validatedData = bulkWristbandOperationSchema.parse(body);

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

      // Verify all wristbands belong to the organizer
      const wristbands = await prisma.wristbandQRCode.findMany({
        where: {
          id: { in: validatedData.wristbandIds },
          organizerId,
          deletedAt: null, // Only operate on non-deleted wristbands
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

      if (wristbands.length !== validatedData.wristbandIds.length) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Some wristbands not found or access denied" 
          },
          { status: 403 }
        );
      }

      let results: any[] = [];
      let updateData: any = {};

      switch (validatedData.operation) {
        case "delete":
          updateData = {
            deletedAt: new Date(),
            deletedBy: session.user.id,
            deletionReason: validatedData.reason,
            status: WristbandQRCodeStatus.REVOKED,
          };
          break;

        case "activate":
          updateData = {
            status: WristbandQRCodeStatus.ACTIVE,
          };
          break;

        case "deactivate":
          updateData = {
            status: WristbandQRCodeStatus.PENDING,
          };
          break;

        case "revoke":
          updateData = {
            status: WristbandQRCodeStatus.REVOKED,
          };
          break;

        case "export":
          // Return wristbands data for export
          results = wristbands;
          break;

        default:
          throw new Error("Invalid operation");
      }

      // Perform bulk update for non-export operations
      if (validatedData.operation !== "export") {
        const bulkUpdateResult = await prisma.wristbandQRCode.updateMany({
          where: { id: { in: validatedData.wristbandIds } },
          data: updateData,
        });

        // Get updated wristbands for response
        results = await prisma.wristbandQRCode.findMany({
          where: { id: { in: validatedData.wristbandIds } },
          include: {
            event: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: `Bulk ${validatedData.operation} operation completed successfully`,
        data: {
          operation: validatedData.operation,
          affectedCount: results.length,
          results,
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
    console.error("Error performing bulk operation on wristbands:", error);

    // Handle specific errors
    if (error.message === "Some wristbands not found or access denied") {
      return NextResponse.json(
        { 
          success: false, 
          error: "Some wristbands not found or you don't have permission to access them" 
        },
        { status: 403 }
      );
    }

    if (error.message === "At least one wristband must be selected") {
      return NextResponse.json(
        { success: false, error: "At least one wristband must be selected" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to perform bulk operation",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/organizer/[organizerId]/wristbands/bulk
 * Get wristbands with enhanced filtering and pagination
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: organizerId } = await params;
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const queryParams = {
      search: searchParams.get("search") || undefined,
      eventId: searchParams.get("eventId") || undefined,
      status: searchParams.get("status") || undefined,
      codeType: searchParams.get("codeType") || undefined,
      isReusable: searchParams.get("isReusable") ? searchParams.get("isReusable") === "true" : undefined,
      validFromStart: searchParams.get("validFromStart") || undefined,
      validFromEnd: searchParams.get("validFromEnd") || undefined,
      validUntilStart: searchParams.get("validUntilStart") || undefined,
      validUntilEnd: searchParams.get("validUntilEnd") || undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20,
      includeDeleted: searchParams.get("includeDeleted") === "true",
    };

    try {
      // Validate query parameters
      const validatedParams = wristbandFilterSchema.parse(queryParams);

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

      // Build where conditions
      const whereConditions: any = {
        organizerId,
      };

      // Include/exclude deleted items
      if (!validatedParams.includeDeleted) {
        whereConditions.deletedAt = null;
      }

      if (validatedParams.eventId) {
        whereConditions.eventId = validatedParams.eventId;
      }

      if (validatedParams.search) {
        whereConditions.OR = [
          { name: { contains: validatedParams.search, mode: "insensitive" } },
          { description: { contains: validatedParams.search, mode: "insensitive" } },
          { qrCode: { contains: validatedParams.search, mode: "insensitive" } },
        ];
      }

      if (validatedParams.status) {
        whereConditions.status = validatedParams.status;
      }

      if (validatedParams.codeType) {
        whereConditions.codeType = validatedParams.codeType;
      }

      if (validatedParams.isReusable !== undefined) {
        whereConditions.isReusable = validatedParams.isReusable;
      }

      // Date range filters
      if (validatedParams.validFromStart || validatedParams.validFromEnd) {
        whereConditions.validFrom = {};
        if (validatedParams.validFromStart) {
          whereConditions.validFrom.gte = new Date(validatedParams.validFromStart);
        }
        if (validatedParams.validFromEnd) {
          whereConditions.validFrom.lte = new Date(validatedParams.validFromEnd);
        }
      }

      if (validatedParams.validUntilStart || validatedParams.validUntilEnd) {
        whereConditions.validUntil = {};
        if (validatedParams.validUntilStart) {
          whereConditions.validUntil.gte = new Date(validatedParams.validUntilStart);
        }
        if (validatedParams.validUntilEnd) {
          whereConditions.validUntil.lte = new Date(validatedParams.validUntilEnd);
        }
      }

      const offset = (validatedParams.page - 1) * validatedParams.limit;

      // Build order by
      const orderBy: any = {};
      orderBy[validatedParams.sortBy] = validatedParams.sortOrder;

      // Execute query
      const [wristbands, total] = await Promise.all([
        prisma.wristbandQRCode.findMany({
          where: whereConditions,
          skip: offset,
          take: validatedParams.limit,
          orderBy,
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
        prisma.wristbandQRCode.count({ where: whereConditions }),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          wristbands: wristbands.map((wristband) => ({
            ...wristband,
            totalScans: wristband._count.scanLogs,
          })),
          pagination: {
            page: validatedParams.page,
            limit: validatedParams.limit,
            total,
            totalPages: Math.ceil(total / validatedParams.limit),
          },
        },
      });
    } catch (validationError: any) {
      // Handle Zod validation errors
      if (validationError.errors) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid query parameters",
            details: validationError.errors,
          },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error: any) {
    console.error("Error fetching wristbands with filters:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch wristbands",
      },
      { status: 500 }
    );
  }
}
