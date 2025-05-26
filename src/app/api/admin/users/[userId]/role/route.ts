// src/app/api/admin/users/[id]/role/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleChangeUserRole } from "~/server/api/users";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { changeRoleSchema } from "~/lib/validations/user.schema";

/**
 * PUT /api/admin/users/[id]/role
 * Change user role
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Only admins can change user roles
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { id } = await params;

    // Parse and validate request body
    const body = await request.json();

    const validatedData = changeRoleSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: validatedData.error.format(),
        },
        { status: 400 },
      );
    }

    // Call business logic
    const updatedUser = await handleChangeUserRole(id, validatedData.data.role);

    // Return response
    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error: any) {
    const { id } = await params;
    console.error(`Error changing role for user with ID ${id}:`, error);

    if (error.message === "User not found") {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    if (error.message === "Cannot change role of the last admin user") {
      return NextResponse.json(
        { success: false, error: "Cannot change role of the last admin user" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to change user role" },
      { status: 500 },
    );
  }
}
