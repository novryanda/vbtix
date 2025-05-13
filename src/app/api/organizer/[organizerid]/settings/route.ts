import { NextRequest, NextResponse } from "next/server";
import { handleGetOrganizerSettings, handleUpdateOrganizerSettings } from "~/server/api/organizer-settings";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { updateOrganizerSettingsSchema } from "~/lib/validations/organizer.schema";

/**
 * GET /api/organizer/settings
 * Get settings for the authenticated organizer
 */
export async function GET(_request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only organizers and admins can access this endpoint
    if (session.user.role !== UserRole.ORGANIZER && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Call business logic
    const settings = await handleGetOrganizerSettings({
      userId: session.user.id
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    console.error("Error getting organizer settings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get organizer settings" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/organizer/settings
 * Update settings for the authenticated organizer
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only organizers and admins can update settings
    if (session.user.role !== UserRole.ORGANIZER && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    try {
      // Validate input using Zod schema
      const validatedData = updateOrganizerSettingsSchema.parse(body);
      
      // Call business logic
      const updatedSettings = await handleUpdateOrganizerSettings({
        userId: session.user.id,
        settingsData: validatedData
      });
      
      // Return response
      return NextResponse.json({
        success: true,
        data: updatedSettings
      });
    } catch (validationError: any) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Validation error", 
          details: validationError.errors || validationError 
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error updating organizer settings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update organizer settings" },
      { status: 500 }
    );
  }
}
