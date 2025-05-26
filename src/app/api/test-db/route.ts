import { NextResponse } from "next/server";
import { prisma } from "~/server/db";

export async function GET() {
  try {
    console.log("Testing database connection...");
    
    // Test basic connection
    await prisma.$connect();
    console.log("✅ Database connected successfully");
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database`);
    
    // Test environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DIRECT_URL: !!process.env.DIRECT_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NODE_ENV: process.env.NODE_ENV,
    };
    
    return NextResponse.json({ 
      success: true, 
      userCount,
      environment: envCheck,
      message: "Database connection successful",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Database connection error:", error);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      environment: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        DIRECT_URL: !!process.env.DIRECT_URL,
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
        NODE_ENV: process.env.NODE_ENV,
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
    
  } finally {
    await prisma.$disconnect();
  }
}
