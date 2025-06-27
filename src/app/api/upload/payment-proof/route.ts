import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { uploadImage } from "~/lib/cloudinary-utils";
import { prisma } from "~/server/db";

/**
 * POST /api/upload/payment-proof
 * Upload payment proof for QRIS payments
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication (optional for guest purchases)
    const session = await auth();

    // Get the form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const orderId = formData.get("orderId") as string;

    // Get session ID for guest access
    const sessionId = req.headers.get("x-session-id");

    // For guest users, we need either a session ID or authentication
    if (!session?.user && !sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication or session ID required for payment proof upload",
          message:
            "Please provide a session ID or log in to upload payment proof",
        },
        { status: 401 },
      );
    }

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 },
      );
    }

    // Validate file type (only images)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed."
        },
        { status: 400 },
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: "File size too large. Maximum size is 5MB."
        },
        { status: 400 },
      );
    }

    // Build where clause for order lookup
    let whereClause: any = {
      id: orderId,
    };

    if (session?.user?.id) {
      // For authenticated users
      whereClause.OR = [
        { userId: session.user.id }, // User owns the order
        // Also check for guest orders with session ID
        ...(sessionId ? [{
          user: {
            phone: `guest_${sessionId}`, // Guest users have phone set to guest_sessionId
          },
        }] : []),
      ];
    } else if (sessionId) {
      // For guest users only
      whereClause.user = {
        phone: `guest_${sessionId}`, // Guest users have phone set to guest_sessionId
      };
    }

    // Verify order exists and belongs to user (or is accessible via session)
    const order = await prisma.transaction.findFirst({
      where: whereClause,
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found or access denied" },
        { status: 404 },
      );
    }

    // Verify this is a QRIS payment
    if (order.paymentMethod !== "QRIS_BY_WONDERS") {
      return NextResponse.json(
        { 
          success: false, 
          error: "Payment proof upload is only allowed for QRIS By Wonders payments" 
        },
        { status: 400 },
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary in payment-proofs folder
    const result = await uploadImage(buffer, "vbticket/payment-proofs");

    // Update order with payment proof information
    const updatedOrder = await prisma.transaction.update({
      where: { id: orderId },
      data: {
        paymentProofUrl: result.secure_url,
        paymentProofPublicId: result.public_id,
        details: {
          ...(order.details as any),
          paymentProofUploaded: true,
          paymentProofUploadedAt: new Date().toISOString(),
        },
      },
    });

    // Return the result with standardized response format
    return NextResponse.json({
      success: true,
      data: {
        paymentProofUrl: result.secure_url,
        paymentProofPublicId: result.public_id,
        orderId: updatedOrder.id,
        message: "Payment proof uploaded successfully",
      },
    });
  } catch (error: any) {
    console.error("Payment proof upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to upload payment proof",
      },
      { status: 500 },
    );
  }
}
