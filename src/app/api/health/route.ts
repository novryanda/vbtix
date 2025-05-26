import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Simple health check endpoint that doesn't require database access
 */
export async function GET() {
  try {
    console.log("🏥 Health check endpoint called");
    
    // Basic environment check
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET_EXISTS: !!process.env.NEXTAUTH_SECRET,
      VERCEL: !!process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    };
    
    console.log("📋 Environment variables:", envCheck);
    
    return NextResponse.json({
      success: true,
      message: "API is healthy",
      environment: envCheck,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
    
  } catch (error) {
    console.error("❌ Health check error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
