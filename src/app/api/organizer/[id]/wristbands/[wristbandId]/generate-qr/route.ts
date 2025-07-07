import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { generateWristbandQRCode } from "~/server/services/wristband-qr.service";
import { prisma } from "~/server/db";
import { z } from "zod";

// Validation schema for route parameters
const paramsSchema = z.object({
  id: z.string().min(1),
  wristbandId: z.string().min(1),
});

/**
 * POST /api/organizer/[id]/wristbands/[wristbandId]/generate-qr
 * Generate QR code for a wristband
 */
export async function POST(
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

    // Generate QR code
    const result = await generateWristbandQRCode({
      wristbandId,
      organizerId,
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
      data: {
        qrCodeImageUrl: result.qrCodeImageUrl,
      },
    });
  } catch (error) {
    console.error("Error generating wristband QR code:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
