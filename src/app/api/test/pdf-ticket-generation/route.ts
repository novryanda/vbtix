import { NextRequest, NextResponse } from "next/server";
import { generateTicketPDF, type TicketPDFData } from "~/lib/services/react-pdf-ticket.service";
import { generateQRCodeData } from "~/lib/services/qr-code.service";
import { emailService } from "~/lib/email-service";

/**
 * POST /api/test/pdf-ticket-generation
 * Test PDF ticket generation and email delivery
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      testType = "pdf-only",
      email = "novryandareza0@gmail.com",
      eventTitle = "Test Event PDF Generation",
      customerName = "Test Customer"
    } = body;

    console.log(`🧪 Testing PDF ticket generation - Type: ${testType}`);

    const testResults: any = {
      testType,
      email,
      timestamp: new Date().toISOString(),
      steps: {},
    };

    // Step 1: Generate test QR data
    testResults.steps.qrDataGeneration = { status: "starting" };
    try {
      const qrData = generateQRCodeData({
        ticketId: "test-ticket-001",
        eventId: "test-event-001",
        userId: "test-user-001",
        transactionId: "test-transaction-001",
        ticketTypeId: "test-ticket-type-001",
        eventDate: new Date(),
      });

      testResults.steps.qrDataGeneration = {
        status: "success",
        data: qrData,
      };
    } catch (error) {
      testResults.steps.qrDataGeneration = {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      throw error;
    }

    // Step 2: Generate test PDF ticket
    testResults.steps.pdfGeneration = { status: "starting" };
    try {
      const ticketPDFData: TicketPDFData = {
        ticketId: "test-ticket-001",
        ticketNumber: "TKT-001-TEST",
        ticketType: "VIP",
        holderName: customerName,
        qrData: testResults.steps.qrDataGeneration.data,
        event: {
          title: eventTitle,
          date: "Sabtu, 15 Juni 2025",
          time: "19:00 WIB",
          location: "Jakarta Convention Center",
          address: "Jl. Gatot Subroto, Jakarta Pusat, DKI Jakarta",
        },
        order: {
          invoiceNumber: "INV-TEST-001",
          totalAmount: 150000,
          paymentDate: "15 Juni 2025, 14:30 WIB",
        },
      };

      const pdfBuffer = await generateTicketPDF(ticketPDFData);
      
      testResults.steps.pdfGeneration = {
        status: "success",
        pdfSize: pdfBuffer.length,
        pdfSizeKB: Math.round(pdfBuffer.length / 1024),
      };

      // If only testing PDF generation, return the PDF
      if (testType === "pdf-only") {
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="test-ticket.pdf"',
          },
        });
      }

      // Step 3: Test email delivery with PDF attachment
      if (testType === "email-with-pdf") {
        testResults.steps.emailDelivery = { status: "starting" };
        try {
          const emailResult = await emailService.sendTicketDeliveryWithPDF({
            to: email,
            customerName,
            event: {
              title: eventTitle,
              date: "Sabtu, 15 Juni 2025",
              time: "19:00 WIB",
              location: "Jakarta Convention Center",
              address: "Jl. Gatot Subroto, Jakarta Pusat, DKI Jakarta",
            },
            order: {
              invoiceNumber: "INV-TEST-001",
              totalAmount: 150000,
              paymentDate: "15 Juni 2025, 14:30 WIB",
            },
            tickets: [{
              id: "test-ticket-001",
              ticketNumber: "TKT-001-TEST",
              ticketType: "VIP",
              holderName: customerName,
              qrCode: undefined,
              // Additional fields for PDF generation
              eventId: "test-event-001",
              userId: "test-user-001",
              transactionId: "test-transaction-001",
              ticketTypeId: "test-ticket-type-001",
              eventDate: new Date(),
            }],
          });

          testResults.steps.emailDelivery = {
            status: emailResult.success ? "success" : "error",
            result: emailResult,
          };

          if (!emailResult.success) {
            throw new Error(emailResult.error || "Email delivery failed");
          }
        } catch (emailError) {
          testResults.steps.emailDelivery = {
            status: "error",
            error: emailError instanceof Error ? emailError.message : "Unknown email error",
          };
          throw emailError;
        }
      }

    } catch (pdfError) {
      testResults.steps.pdfGeneration = {
        status: "error",
        error: pdfError instanceof Error ? pdfError.message : "Unknown PDF error",
      };
      throw pdfError;
    }

    // Return test results
    testResults.overall = {
      status: "success",
      message: testType === "email-with-pdf" 
        ? "PDF ticket generated and email sent successfully"
        : "PDF ticket generated successfully",
    };

    return NextResponse.json({
      success: true,
      data: testResults,
    });

  } catch (error) {
    console.error("❌ PDF ticket generation test failed:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

/**
 * GET /api/test/pdf-ticket-generation
 * Get test information and available test types
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "PDF Ticket Generation Test Endpoint",
    availableTests: {
      "pdf-only": "Generate PDF ticket and return as download",
      "email-with-pdf": "Generate PDF ticket and send via email",
    },
    usage: {
      method: "POST",
      body: {
        testType: "pdf-only | email-with-pdf",
        email: "recipient@example.com (for email tests)",
        eventTitle: "Custom event title (optional)",
        customerName: "Custom customer name (optional)",
      },
    },
    examples: [
      {
        description: "Test PDF generation only",
        body: {
          testType: "pdf-only",
        },
      },
      {
        description: "Test PDF generation and email delivery",
        body: {
          testType: "email-with-pdf",
          email: "test@example.com",
          eventTitle: "My Test Event",
          customerName: "John Doe",
        },
      },
    ],
  });
}
