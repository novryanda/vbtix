import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { generateWristbandBarcode } from "~/server/services/wristband-barcode.service";
import { z } from "zod";

// Validation schema for route parameters
const paramsSchema = z.object({
  id: z.string().cuid({ message: "Invalid organizer ID format" }),
  wristbandId: z.string().cuid({ message: "Invalid wristband ID format" }),
});

/**
 * Generate barcode for a wristband
 * POST /api/organizer/[id]/wristbands/[wristbandId]/barcode
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; wristbandId: string }> }
) {
  try {
    // Await params to resolve the Promise (required in Next.js 15+)
    const resolvedParams = await params;

    // Validate session
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    console.log(`🎫 Generating barcode for wristband via API`);


    // Validate route parameters using resolved params
    const validatedParams = paramsSchema.safeParse(resolvedParams);
    if (!validatedParams.success) {
      console.error("❌ Parameter validation failed:", validatedParams.error.errors);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters: organizer ID and wristband ID must be valid CUID format",
          details: validatedParams.error.errors,
        },
        { status: 400 }
      );
    }


    const { id: organizerId, wristbandId } = validatedParams.data;

    console.log(`🎫 Generating barcode for wristband ${wristbandId} by organizer ${organizerId}`);

    // Generate barcode
    const result = await generateWristbandBarcode({
      wristbandId,
      organizerId,
    });

    if (!result.success) {
      console.warn(`❌ Failed barcode generation for wristband ${wristbandId}: ${result.error}`);

      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    console.log(`✅ Successful barcode generation for wristband ${wristbandId}`);

    return NextResponse.json({
      success: true,
      data: {
        barcodeImageUrl: result.barcodeImageUrl,
        message: "Barcode generated successfully",
      },
    });
  } catch (error) {
    console.error("Error generating wristband barcode:", error);
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
 * Get barcode information for a wristband
 * GET /api/organizer/[id]/wristbands/[wristbandId]/barcode
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; wristbandId: string }> }
) {
  try {
    // Await params to resolve the Promise (required in Next.js 15+)
    const resolvedParams = await params;

    // Validate session
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Validate route parameters
    const validatedParams = paramsSchema.safeParse(resolvedParams);
    if (!validatedParams.success) {
      console.error("❌ Parameter validation failed:", validatedParams.error.errors);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters: organizer ID and wristband ID must be valid CUID format",
          details: validatedParams.error.errors,
        },
        { status: 400 }
      );
    }

    const { id: organizerId, wristbandId } = validatedParams.data;

    // Get wristband with barcode information
    const { prisma } = await import("~/server/db");
    
    const wristband = await prisma.wristbandQRCode.findFirst({
      where: {
        id: wristbandId,
        organizerId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        codeType: true,
        barcodeType: true,
        barcodeValue: true,
        barcodeImageUrl: true,
        barcodeGeneratedAt: true,
        status: true,
        scanCount: true,
        maxScans: true,
        isReusable: true,
        validFrom: true,
        validUntil: true,
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
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        wristband,
      },
    });
  } catch (error) {
    console.error("Error getting wristband barcode:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
