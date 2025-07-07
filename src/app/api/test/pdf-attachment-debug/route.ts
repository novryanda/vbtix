import { NextRequest, NextResponse } from "next/server";
import { generateTicketPDF, type TicketPDFData } from "~/lib/services/react-pdf-ticket.service";
import { generateQRCodeData } from "~/lib/services/qr-code.service";
import { emailService } from "~/lib/email-service";

/**
 * POST /api/test/pdf-attachment-debug
 * Debug PDF attachment functionality step by step
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email = "novryandareza0@gmail.com",
      testStep = "all" // "pdf-only", "attachment-format", "email-send", "all"
    } = body;

    console.log(`🔍 Debugging PDF attachment - Step: ${testStep}`);

    const debugResults: any = {
      testStep,
      email,
      timestamp: new Date().toISOString(),
      steps: {},
    };

    // Step 1: Test QR Code Generation
    debugResults.steps.qrGeneration = { status: "starting" };
    try {
      const qrData = generateQRCodeData({
        ticketId: "debug-ticket-001",
        eventId: "debug-event-001",
        userId: "debug-user-001",
        transactionId: "debug-transaction-001",
        ticketTypeId: "debug-ticket-type-001",
        eventDate: new Date(),
      });

      debugResults.steps.qrGeneration = {
        status: "success",
        qrDataStructure: {
          hasTicketId: !!qrData.ticketId,
          hasEventId: !!qrData.eventId,
          hasUserId: !!qrData.userId,
          hasTransactionId: !!qrData.transactionId,
          hasTicketTypeId: !!qrData.ticketTypeId,
          hasEventDate: !!qrData.eventDate,
          hasSignature: !!qrData.signature,
        },
      };
    } catch (error) {
      debugResults.steps.qrGeneration = {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown QR generation error",
      };
      throw error;
    }

    if (testStep === "pdf-only" || testStep === "all") {
      // Step 2: Test PDF Generation
      debugResults.steps.pdfGeneration = { status: "starting" };
      try {
        const ticketPDFData: TicketPDFData = {
          ticketId: "debug-ticket-001",
          ticketNumber: "DBG-001-TEST",
          ticketType: "Debug VIP",
          holderName: "Debug Customer",
          qrData: debugResults.steps.qrGeneration.qrDataStructure ? 
            generateQRCodeData({
              ticketId: "debug-ticket-001",
              eventId: "debug-event-001",
              userId: "debug-user-001",
              transactionId: "debug-transaction-001",
              ticketTypeId: "debug-ticket-type-001",
              eventDate: new Date(),
            }) : {} as any,
          event: {
            title: "Debug Event PDF Attachment Test",
            date: "Sabtu, 15 Juni 2025",
            time: "19:00 WIB",
            location: "Debug Convention Center",
            address: "Jl. Debug Street, Jakarta Pusat, DKI Jakarta",
          },
          order: {
            invoiceNumber: "INV-DEBUG-001",
            totalAmount: 250000,
            paymentDate: "15 Juni 2025, 14:30 WIB",
          },
        };

        const pdfBuffer = await generateTicketPDF(ticketPDFData);
        
        debugResults.steps.pdfGeneration = {
          status: "success",
          pdfSize: pdfBuffer.length,
          pdfSizeKB: Math.round(pdfBuffer.length / 1024),
          isValidBuffer: Buffer.isBuffer(pdfBuffer),
          bufferType: typeof pdfBuffer,
          firstBytes: Array.from(pdfBuffer.slice(0, 10)),
        };

        // Return PDF if only testing PDF generation
        if (testStep === "pdf-only") {
          return new NextResponse(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'attachment; filename="debug-ticket.pdf"',
            },
          });
        }

      } catch (pdfError) {
        debugResults.steps.pdfGeneration = {
          status: "error",
          error: pdfError instanceof Error ? pdfError.message : "Unknown PDF error",
          stack: pdfError instanceof Error ? pdfError.stack : undefined,
        };
        throw pdfError;
      }
    }

    if (testStep === "attachment-format" || testStep === "all") {
      // Step 3: Test Attachment Format
      debugResults.steps.attachmentFormat = { status: "starting" };
      try {
        const pdfBuffer = debugResults.steps.pdfGeneration?.status === "success" ? 
          await generateTicketPDF({
            ticketId: "debug-ticket-001",
            ticketNumber: "DBG-001-TEST",
            ticketType: "Debug VIP",
            holderName: "Debug Customer",
            qrData: generateQRCodeData({
              ticketId: "debug-ticket-001",
              eventId: "debug-event-001",
              userId: "debug-user-001",
              transactionId: "debug-transaction-001",
              ticketTypeId: "debug-ticket-type-001",
              eventDate: new Date(),
            }),
            event: {
              title: "Debug Event PDF Attachment Test",
              date: "Sabtu, 15 Juni 2025",
              time: "19:00 WIB",
              location: "Debug Convention Center",
              address: "Jl. Debug Street, Jakarta Pusat, DKI Jakarta",
            },
            order: {
              invoiceNumber: "INV-DEBUG-001",
              totalAmount: 250000,
              paymentDate: "15 Juni 2025, 14:30 WIB",
            },
          }) : Buffer.from("test");

        // Test different attachment formats
        const attachmentFormats = [
          {
            name: "resend-standard",
            format: {
              filename: "debug-ticket-resend-standard.pdf",
              content: pdfBuffer,
              type: "application/pdf",
            }
          },
          {
            name: "base64-encoded",
            format: {
              filename: "debug-ticket-base64.pdf",
              content: pdfBuffer.toString('base64'),
              type: "application/pdf",
            }
          },
          {
            name: "with-path",
            format: {
              filename: "debug-ticket-with-path.pdf",
              content: pdfBuffer,
              contentType: "application/pdf",
            }
          }
        ];

        debugResults.steps.attachmentFormat = {
          status: "success",
          testedFormats: attachmentFormats.map(f => ({
            name: f.name,
            hasFilename: !!f.format.filename,
            hasContent: !!f.format.content,
            hasType: !!(f.format.type || (f.format as any).contentType),
            contentType: typeof f.format.content,
            contentSize: typeof f.format.content === 'string' ? f.format.content.length : (f.format.content as Buffer).length,
          })),
        };

      } catch (attachmentError) {
        debugResults.steps.attachmentFormat = {
          status: "error",
          error: attachmentError instanceof Error ? attachmentError.message : "Unknown attachment error",
        };
        throw attachmentError;
      }
    }

    if (testStep === "email-send" || testStep === "all") {
      // Step 4: Test Email Sending with PDF
      debugResults.steps.emailSend = { status: "starting" };
      try {
        const emailResult = await emailService.sendTicketDeliveryWithPDF({
          to: email,
          customerName: "Debug Customer",
          event: {
            title: "Debug Event PDF Attachment Test",
            date: "Sabtu, 15 Juni 2025",
            time: "19:00 WIB",
            location: "Debug Convention Center",
            address: "Jl. Debug Street, Jakarta Pusat, DKI Jakarta",
          },
          order: {
            invoiceNumber: "INV-DEBUG-001",
            totalAmount: 250000,
            paymentDate: "15 Juni 2025, 14:30 WIB",
          },
          tickets: [{
            id: "debug-ticket-001",
            ticketNumber: "DBG-001-TEST",
            ticketType: "Debug VIP",
            holderName: "Debug Customer",
            qrCode: undefined,
            eventId: "debug-event-001",
            userId: "debug-user-001",
            transactionId: "debug-transaction-001",
            ticketTypeId: "debug-ticket-type-001",
            eventDate: new Date(),
          }],
        });

        debugResults.steps.emailSend = {
          status: emailResult.success ? "success" : "error",
          emailResult: emailResult,
          hasMessageId: !!emailResult.messageId,
          hasFullResult: !!emailResult.fullResult,
        };

        if (!emailResult.success) {
          throw new Error(emailResult.error || "Email sending failed");
        }

      } catch (emailError) {
        debugResults.steps.emailSend = {
          status: "error",
          error: emailError instanceof Error ? emailError.message : "Unknown email error",
          stack: emailError instanceof Error ? emailError.stack : undefined,
        };
        throw emailError;
      }
    }

    // Overall results
    debugResults.overall = {
      status: "success",
      message: "All debug steps completed successfully",
      summary: {
        qrGeneration: debugResults.steps.qrGeneration?.status,
        pdfGeneration: debugResults.steps.pdfGeneration?.status,
        attachmentFormat: debugResults.steps.attachmentFormat?.status,
        emailSend: debugResults.steps.emailSend?.status,
      },
    };

    return NextResponse.json({
      success: true,
      data: debugResults,
    });

  } catch (error) {
    console.error("❌ PDF attachment debug failed:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

/**
 * GET /api/test/pdf-attachment-debug
 * Get debug information and available test steps
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "PDF Attachment Debug Endpoint",
    availableSteps: {
      "pdf-only": "Test PDF generation only and return as download",
      "attachment-format": "Test different attachment formats for Resend",
      "email-send": "Test complete email sending with PDF attachment",
      "all": "Run all debug steps sequentially",
    },
    usage: {
      method: "POST",
      body: {
        email: "recipient@example.com",
        testStep: "pdf-only | attachment-format | email-send | all",
      },
    },
    examples: [
      {
        description: "Test PDF generation only",
        body: { testStep: "pdf-only" },
      },
      {
        description: "Test attachment formats",
        body: { testStep: "attachment-format" },
      },
      {
        description: "Test complete email flow",
        body: { 
          testStep: "email-send",
          email: "test@example.com"
        },
      },
      {
        description: "Run all debug steps",
        body: { 
          testStep: "all",
          email: "test@example.com"
        },
      },
    ],
  });
}
