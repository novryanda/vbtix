import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { validateWristbandQRCode, scanWristbandQRCode } from "~/server/services/wristband-qr.service";
import { validateWristbandBarcode, scanWristbandBarcode } from "~/server/services/wristband-barcode.service";
import { prisma } from "~/server/db";
import { z } from "zod";

// Validation schema for request body
const validateWristbandSchema = z.object({
  qrCodeData: z.string().optional(), // QR code data (legacy)
  barcodeData: z.string().optional(), // Barcode data (new)
  codeData: z.string().min(1, "Code data is required"), // Generic code data
  codeType: z.enum(["QR", "BARCODE"]).optional().default("BARCODE"), // Code type
  scan: z.boolean().optional().default(false), // Whether to log the scan
  scanLocation: z.string().optional(),
  scanDevice: z.string().optional(),
}).refine(
  (data) => data.qrCodeData || data.barcodeData || data.codeData,
  {
    message: "Either qrCodeData, barcodeData, or codeData is required",
  }
);

// Validation schema for route parameters
const paramsSchema = z.object({
  id: z.string().min(1),
});

/**
 * POST /api/organizer/[id]/wristbands/validate
 * Validate wristband QR code and optionally log scan
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
    const validatedData = validateWristbandSchema.safeParse(body);

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

    const { qrCodeData, barcodeData, codeData, codeType, scan, scanLocation, scanDevice } = validatedData.data;

    // Determine the actual code data and type
    const actualCodeData = codeData || barcodeData || qrCodeData!;
    const actualCodeType = codeType || (qrCodeData ? "QR" : "BARCODE");

    console.log(`🎫 ${scan ? 'Scanning' : 'Validating'} wristband (${actualCodeType}) by organizer ${organizerId}`);

    if (scan) {
      // Scan the wristband (validate and log) based on code type
      const result = actualCodeType === "BARCODE"
        ? await scanWristbandBarcode(
            actualCodeData,
            organizerId,
            session.user.id,
            scanLocation,
            scanDevice
          )
        : await scanWristbandQRCode(
            actualCodeData,
            organizerId,
            session.user.id,
            scanLocation,
            scanDevice
          );

      if (!result.success) {
        console.warn(`❌ Failed wristband scan attempt by organizer ${organizerId}: ${result.error}`);

        return NextResponse.json(
          {
            success: false,
            error: result.error,
          },
          { status: 400 }
        );
      }

      console.log(`✅ Successful wristband scan by organizer ${organizerId} for wristband ${result.wristband?.id}`);

      return NextResponse.json({
        success: true,
        data: {
          wristband: result.wristband,
          scanLog: result.scanLog,
          message: "Wristband scanned successfully",
        },
      });
    } else {
      // Just validate the wristband based on code type
      const result = actualCodeType === "BARCODE"
        ? await validateWristbandBarcode(actualCodeData, organizerId)
        : await validateWristbandQRCode(actualCodeData, organizerId);

      if (!result.success) {
        console.warn(`❌ Failed wristband validation by organizer ${organizerId}: ${result.error}`);

        return NextResponse.json(
          {
            success: false,
            error: result.error,
          },
          { status: 400 }
        );
      }

      console.log(`✅ Successful wristband validation by organizer ${organizerId} for wristband ${result.wristband?.id}`);

      return NextResponse.json({
        success: true,
        data: {
          wristband: result.wristband,
          message: "Wristband is valid",
        },
      });
    }
  } catch (error) {
    console.error("Error validating wristband QR code:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
