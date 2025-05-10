import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Implementasi untuk mendapatkan daftar event untuk buyer
    return NextResponse.json({ 
      success: true, 
      message: "Events retrieved successfully",
      data: [] 
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
