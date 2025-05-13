import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { ordesId: string } },
) {
  try {
    const { ordesId } = params;

    // Implementasi untuk mendapatkan detail order berdasarkan ID
    return NextResponse.json({
      success: true,
      message: "Order details retrieved successfully",
      data: { id: ordesId },
    });
  } catch (error) {
    console.error(`Error fetching order with ID ${params.ordesId}:`, error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch order details" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { ordesId: string } },
) {
  try {
    const { ordesId } = params;

    // Implementasi untuk membatalkan order
    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.error(`Error cancelling order with ID ${params.ordesId}:`, error);
    return NextResponse.json(
      { success: false, message: "Failed to cancel order" },
      { status: 500 },
    );
  }
}
