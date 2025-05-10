import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken, consumeToken } from "~/server/services/verification.service";
import { findUserByEmail, changePassword } from "~/server/services/auth.service";

// Define validation schema
const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const result = resetPasswordSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { success: false, errors: result.error.errors },
                { status: 400 }
            );
        }

        const { token, password } = result.data;

        // Verify the token
        const verification = await verifyToken(token);
        if (!verification.success) {
            return NextResponse.json(
                { success: false, message: verification.message },
                { status: 400 }
            );
        }

        // Get the user by email
        const user = await findUserByEmail(verification.identifier);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        // Change the user's password
        await changePassword(user.id, password);

        // Consume the token (delete it)
        await consumeToken(token);

        return NextResponse.json(
            { success: true, message: "Password reset successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Password reset error:", error);
        return NextResponse.json(
            { success: false, message: "An error occurred during password reset" },
            { status: 500 }
        );
    }
}