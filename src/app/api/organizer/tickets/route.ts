import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Implementasi untuk mendapatkan daftar tipe tiket yang dibuat oleh organizer
    const eventId = req.nextUrl.searchParams.get("eventId");
    
    return NextResponse.json({ 
      success: true, 
      message: "Ticket types retrieved successfully",
      data: [] 
    });
  } catch (error) {
    console.error("Error fetching ticket types:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch ticket types" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Implementasi untuk membuat tipe tiket baru
    return NextResponse.json({ 
      success: true, 
      message: "Ticket type created successfully",
      data: { id: "sample-ticket-type-id" } 
    });
  } catch (error) {
    console.error("Error creating ticket type:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create ticket type" },
      { status: 500 }
    );
  }
}
