import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { 
  validateUnifiedQRCode, 
  scanUnifiedQRCode,
  detectQRCodeType,
  getQRCodeTypeInfo,
  QRCodeType 
} from "~/server/services/unified-qr-validation.service";
import { prisma } from "~/server/db";
import { z } from "zod";

// Validation schema for request body
const validateUnifiedQRSchema = z.object({
  qrCodeData: z.string().min(1, "QR code data is required"),
  action: z.enum(["validate", "scan"]).default("validate"),
  checkIn: z.boolean().optional().default(false), // For tickets
  scanLocation: z.string().optional(),
  scanDevice: z.string().optional(),
});

// Validation schema for route parameters
const paramsSchema = z.object({
  id: z.string().min(1),
});

/**
 * POST /api/organizer/[id]/qr-code/unified-validate
 * Unified QR code validation that handles both tickets and wristbands
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
    const validatedData = validateUnifiedQRSchema.safeParse(body);

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

    const { qrCodeData, action, checkIn, scanLocation, scanDevice } = validatedData.data;

    // First detect the QR code type
    const qrType = await detectQRCodeType(qrCodeData);
    const typeInfo = getQRCodeTypeInfo(qrType);

    if (qrType === QRCodeType.UNKNOWN) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or unrecognized QR code format",
          qrType: qrType,
          typeInfo: typeInfo,
        },
        { status: 400 }
      );
    }

    let result;

    if (action === "scan") {
      // Perform scan (with logging)
      result = await scanUnifiedQRCode(qrCodeData, organizerId, session.user.id, {
        checkIn: qrType === QRCodeType.TICKET ? checkIn : undefined,
        scanLocation,
        scanDevice,
      });

      if (!result.success) {
        console.warn(`❌ Failed unified QR scan attempt by organizer ${organizerId}: ${result.error}`);

        return NextResponse.json(
          {
            success: false,
            error: result.error,
            qrType: result.type,
            typeInfo: getQRCodeTypeInfo(result.type),
          },
          { status: 400 }
        );
      }

      console.log(`✅ Successful unified QR scan by organizer ${organizerId} - Type: ${result.type}`);

      return NextResponse.json({
        success: true,
        qrType: result.type,
        typeInfo: typeInfo,
        data: result.data,
        message: result.data?.message || "QR code scanned successfully",
      });
    } else {
      // Just validate (no logging)
      result = await validateUnifiedQRCode(qrCodeData, organizerId);

      if (!result.success) {
        console.warn(`❌ Failed unified QR validation by organizer ${organizerId}: ${result.error}`);

        return NextResponse.json(
          {
            success: false,
            error: result.error,
            qrType: result.type,
            typeInfo: getQRCodeTypeInfo(result.type),
          },
          { status: 400 }
        );
      }

      console.log(`✅ Successful unified QR validation by organizer ${organizerId} - Type: ${result.type}`);

      return NextResponse.json({
        success: true,
        qrType: result.type,
        typeInfo: typeInfo,
        data: result.data,
        message: result.data?.message || "QR code is valid",
      });
    }
  } catch (error) {
    console.error("Error in unified QR validation:", error);
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
 * GET /api/organizer/[id]/qr-code/unified-validate
 * Get information about QR code types supported
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
        },
        { status: 400 }
      );
    }

    // Get user session
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

    return NextResponse.json({
      success: true,
      supportedTypes: {
        [QRCodeType.TICKET]: getQRCodeTypeInfo(QRCodeType.TICKET),
        [QRCodeType.WRISTBAND]: getQRCodeTypeInfo(QRCodeType.WRISTBAND),
      },
      actions: {
        validate: "Check QR code validity without logging",
        scan: "Validate and log the scan activity",
      },
    });
  } catch (error) {
    console.error("Error getting QR type info:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
