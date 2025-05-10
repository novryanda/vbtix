import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Implementasi untuk mendapatkan daftar order yang dimiliki buyer
    return NextResponse.json({ 
      success: true, 
      message: "Orders retrieved successfully",
      data: [] 
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
