import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Implementasi untuk mendapatkan daftar e-ticket yang dimiliki buyer
    return NextResponse.json({ 
      success: true, 
      message: "E-tickets retrieved successfully",
      data: [] 
    });
  } catch (error) {
    console.error("Error fetching e-tickets:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch e-tickets" },
      { status: 500 }
    );
  }
}
