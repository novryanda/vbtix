import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { eticketsId: string } },
) {
  try {
    const { eticketsId } = params;

    // Implementasi untuk mendapatkan detail e-ticket berdasarkan ID
    return NextResponse.json({
      success: true,
      message: "E-ticket details retrieved successfully",
      data: { id: eticketsId },
    });
  } catch (error) {
    console.error(
      `Error fetching e-ticket with ID ${params.eticketsId}:`,
      error,
    );
    return NextResponse.json(
      { success: false, message: "Failed to fetch e-ticket details" },
      { status: 500 },
    );
  }
}
