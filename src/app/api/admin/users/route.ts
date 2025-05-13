// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleGetUsers, handleCreateUser } from "~/server/api/users";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { createUserSchema, userQuerySchema } from "~/lib/validations/user.schema";

/**
 * GET /api/admin/users
 * Get all users with pagination and filtering
 */
export async function GET(request: NextRequest) {
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

        // Get query parameters and validate
        try {
            const searchParams = request.nextUrl.searchParams;

            // Gunakan nilai default jika parameter tidak ada
            const page = searchParams.has("page") ? searchParams.get("page") : "1";
            const limit = searchParams.has("limit") ? searchParams.get("limit") : "10";
            const role = searchParams.has("role") ? searchParams.get("role") : null;
            const search = searchParams.has("search") ? searchParams.get("search") : null;
            const isActive = searchParams.has("isActive") ? searchParams.get("isActive") : null;

            const queryParams = { page, limit, role, search, isActive };

            console.log("Query params:", queryParams);

            // Validasi parameter
            const validatedParams = userQuerySchema.safeParse(queryParams);

            if (!validatedParams.success) {
                console.error("Validation error:", validatedParams.error.format());

                // Gunakan nilai default jika validasi gagal
                const defaultParams = {
                    page: 1,
                    limit: 10,
                    role: undefined,
                    search: undefined,
                    isActive: undefined
                };

                // Panggil business logic dengan parameter default
                const result = await handleGetUsers(defaultParams);

                // Return response
                return NextResponse.json({
                    success: true,
                    data: result.users.length > 0 ? result.users : [],
                    meta: result.meta
                });
            }

            // Jika validasi berhasil, gunakan parameter yang divalidasi
            const result = await handleGetUsers(validatedParams.data);

            // Return response
            return NextResponse.json({
                success: true,
                data: result.users.length > 0 ? result.users : [],
                meta: result.meta
            });
        } catch (error) {
            console.error("Error processing query parameters:", error);

            // Gunakan nilai default jika terjadi error
            const defaultParams = {
                page: 1,
                limit: 10
            };

            // Panggil business logic dengan parameter default
            const result = await handleGetUsers(defaultParams);

            // Return response
            return NextResponse.json({
                success: true,
                data: result.users.length > 0 ? result.users : [],
                meta: result.meta
            });
        }
    } catch (error: any) {
        console.error("Error getting users:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to get users" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/users
 * Create a new user
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

        // Only admins can create users
        if (session.user.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { success: false, error: "Forbidden" },
                { status: 403 }
            );
        }

        // Parse and validate request body
        const body = await request.json();

        const validatedData = createUserSchema.safeParse(body);
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
        const user = await handleCreateUser(validatedData.data);

        // Return response
        return NextResponse.json({
            success: true,
            data: user
        }, { status: 201 });
    } catch (error: any) {
        console.error("Error creating user:", error);

        // Handle specific errors
        if (error.message === "Email is already taken") {
            return NextResponse.json(
                { success: false, error: "Email is already in use" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: false, error: error.message || "Failed to create user" },
            { status: 500 }
        );
    }
}