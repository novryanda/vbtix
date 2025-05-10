import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken, consumeToken } from "~/server/services/verification.service";
import { verifyEmail } from "~/server/services/auth.service";
import { findUserByEmail } from "~/server/services/auth.service";

// Define validation schema
const verifySchema = z.object({
    token: z.string(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const result = verifySchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { success: false, errors: result.error.errors },
                { status: 400 }
            );
        }

        const { token } = result.data;

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

        // Mark the user's email as verified
        await verifyEmail(user.id);

        // Consume the token (delete it)
        await consumeToken(token);

        return NextResponse.json(
            { success: true, message: "Email verified successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Verification error:", error);
        return NextResponse.json(
            { success: false, message: "An error occurred during verification" },
            { status: 500 }
        );
    }
}