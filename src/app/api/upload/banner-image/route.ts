import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { uploadImage } from "~/lib/cloudinary-utils";

/**
 * POST /api/upload/banner-image
 * Upload a banner image to Cloudinary
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins can upload banner images
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const customFolder = formData.get("folder") as string;

    // Use the provided folder or default to banners folder
    const folder = customFolder || "vbticket/banners";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid file type. Only JPG, PNG, and WebP are allowed." 
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          success: false, 
          error: "File too large. Maximum size is 5MB." 
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary with banner-specific transformations
    const result = await uploadImage(buffer, folder, {
      transformation: {
        quality: "auto:good",
        fetch_format: "auto",
        width: 1200,
        height: 400,
        crop: "fill",
        gravity: "center"
      }
    });

    // Return standardized response
    return NextResponse.json({
      success: true,
      data: {
        secure_url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error: any) {
    console.error("Error uploading banner image:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to upload banner image",
      },
      { status: 500 }
    );
  }
}
