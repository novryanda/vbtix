// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
    handleGetUserById,
    handleUpdateUser,
    handleDeleteUser
} from "~/server/api/users";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { updateUserSchema } from "~/lib/validations/user.schema";

/**
 * GET /api/admin/users/[id]
 * Get user details by ID
 */
export async function GET(
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

        // Only admins can access this endpoint
        if (session.user.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { success: false, error: "Forbidden" },
                { status: 403 }
            );
        }

        const { id } = params;

        // Call business logic
        const user = await handleGetUserById(id);

        // Return response
        return NextResponse.json({
            success: true,
            data: user
        });
    } catch (error: any) {
        console.error(`Error getting user with ID ${params.id}:`, error);

        if (error.message === "User not found") {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: false, error: error.message || "Failed to get user details" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/admin/users/[id]
 * Update user details
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

        // Only admins can update users
        if (session.user.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { success: false, error: "Forbidden" },
                { status: 403 }
            );
        }

        const { id } = params;

        // Parse and validate request body
        const body = await request.json();

        const validatedData = updateUserSchema.safeParse(body);
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
        const updatedUser = await handleUpdateUser(id, validatedData.data);

        // Return response
        return NextResponse.json({
            success: true,
            data: updatedUser
        });
    } catch (error: any) {
        console.error(`Error updating user with ID ${params.id}:`, error);

        if (error.message === "User not found") {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        if (error.message === "Email is already taken") {
            return NextResponse.json(
                { success: false, error: "Email is already in use" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: false, error: error.message || "Failed to update user" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete a user
 */
export async function DELETE(
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

        // Only admins can delete users
        if (session.user.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { success: false, error: "Forbidden" },
                { status: 403 }
            );
        }

        const { id } = params;

        // Call business logic
        await handleDeleteUser(id);

        // Return response
        return NextResponse.json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error: any) {
        console.error(`Error deleting user with ID ${params.id}:`, error);

        if (error.message === "User not found") {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        if (error.message === "Cannot delete the last admin user") {
            return NextResponse.json(
                { success: false, error: "Cannot delete the last admin user" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: error.message || "Failed to delete user" },
            { status: 500 }
        );
    }
}