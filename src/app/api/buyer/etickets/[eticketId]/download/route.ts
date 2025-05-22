import { NextRequest, NextResponse } from "next/server";
import { handleGetETicketById } from "~/server/api/etickets";
import { auth } from "~/server/auth";

/**
 * GET /api/buyer/etickets/[id]/download
 * Download a specific e-ticket as PDF
 * This endpoint requires authentication
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required to download e-tickets",
          message: "Please log in to download e-tickets",
        },
        { status: 401 },
      );
    }

    const { id } = params;

    // Get e-ticket by ID
    const eticket = await handleGetETicketById({
      eticketId: id,
      userId: session.user.id,
    });

    // In a real implementation, this would generate a PDF file
    // For now, we'll return a placeholder response

    // Generate a simple text representation of the e-ticket
    const eticketText = `
E-Ticket: ${eticket.id}
QR Code: ${eticket.qrCodeData}
Event: ${eticket.ticket?.event.title || "Unknown Event"}
Venue: ${eticket.ticket?.event.venue || "Unknown Venue"}
Date: ${eticket.ticket?.event.formattedStartDate || "Unknown Date"}
Ticket Type: ${eticket.ticket?.ticketType.name || "Unknown Ticket Type"}
Price: ${eticket.ticket?.ticketType.price || 0} ${eticket.ticket?.ticketType.currency || "IDR"}
Order: ${eticket.order.invoiceNumber}
    `;

    // Return the e-ticket as a downloadable file
    return new NextResponse(eticketText, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="eticket-${id}.txt"`,
      },
    });
  } catch (error: any) {
    console.error(`Error downloading e-ticket with ID ${params.id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to download e-ticket",
      },
      {
        status: error.message === "E-ticket not found" ? 404 : 500,
      },
    );
  }
}
