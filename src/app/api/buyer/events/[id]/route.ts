import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Implementasi untuk mendapatkan detail event berdasarkan ID
    return NextResponse.json({ 
      success: true, 
      message: "Event details retrieved successfully",
      data: { id } 
    });
  } catch (error) {
    console.error(`Error fetching event with ID ${params.id}:`, error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch event details" },
      { status: 500 }
    );
  }
}
