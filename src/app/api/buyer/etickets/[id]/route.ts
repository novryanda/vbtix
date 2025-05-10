import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Implementasi untuk mendapatkan detail e-ticket berdasarkan ID
    return NextResponse.json({ 
      success: true, 
      message: "E-ticket details retrieved successfully",
      data: { id } 
    });
  } catch (error) {
    console.error(`Error fetching e-ticket with ID ${params.id}:`, error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch e-ticket details" },
      { status: 500 }
    );
  }
}
