import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUser, findUserByEmail } from "~/server/services/auth.service";
import { generateVerificationToken } from "~/server/services/verification.service";
import { sendVerificationEmail } from "~/server/services/email-service";

// Define validation schema
const registerSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    role: z.enum(["ADMIN", "ORGANIZER", "BUYER"]).default("BUYER"),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const result = registerSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { success: false, errors: result.error.errors },
                { status: 400 }
            );
        }

        const { name, email, password, role } = result.data;

        // Check if user already exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: "Email already in use" },
                { status: 400 }
            );
        }

        // Create user
        const user = await createUser({
            name,
            email,
            password,
            role,
        });

        // Generate verification token
        const verificationToken = await generateVerificationToken(email);

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        return NextResponse.json(
            {
                success: true,
                user: { id: user.id, name: user.name, email: user.email },
                message: "Registration successful. Please check your email to verify your account."
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { success: false, error: "An error occurred during registration" },
            { status: 500 }
        );
    }
}
