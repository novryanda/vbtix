// src/app/api/admin/users/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleToggleUserStatus } from "~/server/api/users";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { toggleStatusSchema } from "~/lib/validations/user.schema";

/**
 * PUT /api/admin/users/[id]/status
 * Activate or deactivate user
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
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

        // Only admins can change user status
        if (session.user.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { success: false, error: "Forbidden" },
                { status: 403 }
            );
        }

        const { id } = params;

        // Parse and validate request body
        const body = await request.json();

        const validatedData = toggleStatusSchema.safeParse(body);
        if (!validatedData.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Validation error",
                    details: validatedData.error.format()
                },
                { status: 400 }
            );
        }

        // Call business logic
        const updatedUser = await handleToggleUserStatus(id, validatedData.data.isActive);

        // Return response
        return NextResponse.json({
            success: true,
            data: updatedUser
        });
    } catch (error: any) {
        console.error(`Error changing status for user with ID ${params.id}:`, error);

        if (error.message === "User not found") {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        if (error.message === "Cannot deactivate the last active admin user") {
            return NextResponse.json(
                { success: false, error: "Cannot deactivate the last active admin user" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: error.message || "Failed to change user status" },
            { status: 500 }
        );
    }
}