import { NextResponse } from "next/server";
import { prisma } from "~/server/db";

export async function GET() {
  console.log("🔍 Starting database connection test...");

  try {
    // First check if environment variables exist
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DIRECT_URL: !!process.env.DIRECT_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NODE_ENV: process.env.NODE_ENV,
    };

    console.log("📋 Environment check:", envCheck);

    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    console.log("🔌 Testing database connection...");

    // Test basic connection
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database`);

    return NextResponse.json({
      success: true,
      userCount,
      environment: envCheck,
      message: "Database connection successful",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Database connection error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
        environment: {
          DATABASE_URL: !!process.env.DATABASE_URL,
          DIRECT_URL: !!process.env.DIRECT_URL,
          NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
          NODE_ENV: process.env.NODE_ENV,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  } finally {
    try {
      await prisma.$disconnect();
      console.log("🔌 Database disconnected");
    } catch (disconnectError) {
      console.error("⚠️ Error disconnecting from database:", disconnectError);
    }
  }
}
