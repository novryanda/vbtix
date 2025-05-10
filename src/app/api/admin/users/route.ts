import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");
    const role = req.nextUrl.searchParams.get("role");
    
    // Implementasi untuk mendapatkan daftar pengguna
    return NextResponse.json({ 
      success: true, 
      message: "Users retrieved successfully",
      data: {
        users: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      } 
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
