import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { eventsId: string } },
) {
  try {
    const { eventsId } = params;

    // Implementasi untuk mendapatkan detail event berdasarkan ID
    return NextResponse.json({
      success: true,
      message: "Event details retrieved successfully",
      data: { id: eventsId },
    });
  } catch (error) {
    console.error(`Error fetching event with ID ${params.eventsId}:`, error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch event details" },
      { status: 500 },
    );
  }
}
