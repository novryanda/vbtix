import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Implementasi untuk mendapatkan data dashboard admin
    return NextResponse.json({ 
      success: true, 
      message: "Admin dashboard data retrieved successfully",
      data: {
        totalUsers: 0,
        totalEvents: 0,
        totalOrders: 0,
        pendingApprovals: 0
      } 
    });
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch admin dashboard data" },
      { status: 500 }
    );
  }
}
