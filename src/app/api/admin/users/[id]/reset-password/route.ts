// src/app/api/admin/users/[id]/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleResetUserPassword } from "~/server/api/users";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { resetPasswordSchema } from "~/lib/validations/user.schema";

/**
 * POST /api/admin/users/[id]/reset-password
 * Reset user password
 */
export async function POST(
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

        // Only admins can reset user passwords
        if (session.user.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { success: false, error: "Forbidden" },
                { status: 403 }
            );
        }

        const { id } = params;

        // Parse and validate request body
        const body = await request.json();

        const validatedData = resetPasswordSchema.safeParse(body);
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
        const result = await handleResetUserPassword(id, {
            sendEmail: validatedData.data.sendEmail,
            customPassword: validatedData.data.customPassword
        });

        // Return response
        return NextResponse.json({
            success: true,
            data: {
                id: result.id,
                email: result.email,
                password: result.password, // Mengembalikan password baru ke admin
                resetAt: result.resetAt
            },
            message: "Password has been reset successfully"
        });
    } catch (error: any) {
        console.error(`Error resetting password for user with ID ${params.id}:`, error);

        if (error.message === "User not found") {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: false, error: error.message || "Failed to reset user password" },
            { status: 500 }
        );
    }
}