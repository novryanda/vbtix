import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const reportType = req.nextUrl.searchParams.get("type") || "sales";
    const startDate = req.nextUrl.searchParams.get("startDate");
    const endDate = req.nextUrl.searchParams.get("endDate");
    
    // Implementasi untuk mendapatkan laporan admin
    return NextResponse.json({ 
      success: true, 
      message: "Admin report retrieved successfully",
      data: {
        reportType,
        startDate,
        endDate,
        data: []
      } 
    });
  } catch (error) {
    console.error("Error fetching admin report:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch admin report" },
      { status: 500 }
    );
  }
}
