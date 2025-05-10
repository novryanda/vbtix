import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Implementasi untuk mengunduh e-ticket sebagai PDF
    // Dalam implementasi sebenarnya, ini akan mengembalikan file PDF
    
    return new NextResponse("E-ticket PDF content", {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="eticket-${id}.pdf"`
      }
    });
  } catch (error) {
    console.error(`Error downloading e-ticket with ID ${params.id}:`, error);
    return NextResponse.json(
      { success: false, message: "Failed to download e-ticket" },
      { status: 500 }
    );
  }
}
