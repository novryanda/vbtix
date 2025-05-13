import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { eticketsId: string } },
) {
  try {
    const { eticketsId } = params;

    // Implementasi untuk mengunduh e-ticket sebagai PDF
    // Dalam implementasi sebenarnya, ini akan mengembalikan file PDF

    return new NextResponse("E-ticket PDF content", {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="eticket-${eticketsId}.pdf"`,
      },
    });
  } catch (error) {
    console.error(
      `Error downloading e-ticket with ID ${params.eticketsId}:`,
      error,
    );
    return NextResponse.json(
      { success: false, message: "Failed to download e-ticket" },
      { status: 500 },
    );
  }
}
