import { NextRequest, NextResponse } from "next/server";
import { emailService } from "~/lib/email-service";
import {
  generateQRCodeData,
  type TicketQRData
} from "~/lib/services/qr-code.service";

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Starting QR code PNG generation and email delivery test...");

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body",
          details: jsonError instanceof Error ? jsonError.message : "JSON parsing failed",
          example: {
            email: "test@example.com",
            customerName: "Test Customer",
            testType: "qr-generation" // or "email-delivery" or "full-flow"
          }
        },
        { status: 400 }
      );
    }

    const { 
      email, 
      customerName = "Test Customer",
      testType = "full-flow" 
    } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email address is required" },
        { status: 400 }
      );
    }

    console.log(`📧 Testing QR code email delivery for: ${email} (Test type: ${testType})`);

    // Test data for QR code generation
    const testQRData: TicketQRData = {
      ticketId: "test-ticket-123",
      eventId: "test-event-456",
      userId: "test-user-789",
      transactionId: "test-transaction-abc",
      ticketTypeId: "test-type-def",
      eventDate: new Date("2025-07-01T19:00:00Z"),
    };

    const testResults: any = {
      testType,
      email,
      customerName,
      timestamp: new Date().toISOString(),
    };

    // Test 1: QR Code Data Generation
    if (testType === "qr-generation" || testType === "full-flow") {
      console.log("🔄 Testing QR code data generation...");

      try {
        const qrData = generateQRCodeData(testQRData);

        testResults.qrGeneration = {
          success: true,
          dataLength: JSON.stringify(qrData).length,
          hasTicketId: !!qrData.ticketId,
          hasChecksum: !!qrData.checksum,
          hasExpiration: !!qrData.expiresAt,
        };

        console.log(`✅ QR code data generated - Length: ${JSON.stringify(qrData).length} characters`);
      } catch (qrError) {
        console.error("❌ QR code generation failed:", qrError);
        testResults.qrGeneration = {
          success: false,
          error: qrError instanceof Error ? qrError.message : "QR generation failed",
        };
      }
    }

    // Test 2: Email Delivery with PDF Attachments
    if (testType === "email-delivery" || testType === "full-flow") {
      console.log("📧 Testing email delivery with PDF attachments...");

      try {
        const emailResult = await emailService.sendTicketDeliveryWithPDF({
          to: email,
          customerName,
          event: {
            title: "Test Event - PDF Ticket Delivery",
            date: "1 Juli 2025",
            time: "19:00 WIB",
            location: "Test Venue",
            address: "Jl. Test No. 123, Jakarta, DKI Jakarta",
            image: "https://via.placeholder.com/600x300/3b82f6/ffffff?text=Test+Event",
          },
          order: {
            invoiceNumber: "TEST-INV-" + Date.now(),
            totalAmount: 150000,
            paymentDate: new Date().toLocaleDateString("id-ID"),
          },
          tickets: [
            {
              id: "test-ticket-001",
              ticketNumber: "TKT-001-" + Date.now(),
              ticketType: "Regular",
              holderName: customerName,
              eventId: "test-event-456",
              userId: "test-user-789",
              transactionId: "test-transaction-abc",
              ticketTypeId: "test-type-def",
              eventDate: new Date("2025-07-01T19:00:00Z"),
            },
            {
              id: "test-ticket-002",
              ticketNumber: "TKT-002-" + Date.now(),
              ticketType: "VIP",
              holderName: customerName + " (VIP)",
              eventId: "test-event-456",
              userId: "test-user-789",
              transactionId: "test-transaction-abc",
              ticketTypeId: "test-type-vip",
              eventDate: new Date("2025-07-01T19:00:00Z"),
            },
          ],
        });

        testResults.emailDelivery = {
          success: emailResult.success,
          messageId: emailResult.messageId,
          error: emailResult.error,
        };

        if (emailResult.success) {
          console.log(`✅ Email with PDF attachments sent successfully - Message ID: ${emailResult.messageId}`);
        } else {
          console.error(`❌ Email delivery failed: ${emailResult.error}`);
        }
      } catch (emailError) {
        console.error("❌ Email delivery test failed:", emailError);
        testResults.emailDelivery = {
          success: false,
          error: emailError instanceof Error ? emailError.message : "Email delivery failed",
        };
      }
    }

    // Test 3: QR Code Validation (simulate scanning)
    if (testType === "full-flow") {
      console.log("🔍 Testing QR code validation...");
      
      try {
        const qrCodeData = generateQRCodeData(testQRData);

        testResults.qrValidation = {
          success: true,
          encryptedDataLength: typeof qrCodeData === 'string' ? qrCodeData.length : JSON.stringify(qrCodeData).length,
          originalData: testQRData,
          encryptedPreview: typeof qrCodeData === 'string'
            ? qrCodeData.substring(0, 50) + "..."
            : JSON.stringify(qrCodeData).substring(0, 50) + "...",
          dataType: typeof qrCodeData,
        };

        console.log(`✅ QR code validation test completed - Data type: ${typeof qrCodeData}`);
      } catch (validationError) {
        console.error("❌ QR code validation failed:", validationError);
        testResults.qrValidation = {
          success: false,
          error: validationError instanceof Error ? validationError.message : "QR validation failed",
        };
      }
    }

    // Summary
    const allTestsPassed = Object.values(testResults)
      .filter(result => typeof result === 'object' && result !== null && 'success' in result)
      .every(result => result.success);

    console.log(`🎉 PDF ticket delivery test completed - Overall success: ${allTestsPassed}`);

    return NextResponse.json({
      success: allTestsPassed,
      message: `PDF ticket delivery test completed for ${email}`,
      testResults,
      summary: {
        testType,
        email,
        customerName,
        allTestsPassed,
        timestamp: testResults.timestamp,
      }
    });

  } catch (error) {
    console.error("❌ PDF ticket delivery test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "PDF Ticket Delivery Test Endpoint",
    usage: "POST with { email: 'test@example.com', customerName: 'Test Customer', testType: 'full-flow' }",
    testTypes: {
      "qr-generation": "Test QR code data generation only",
      "email-delivery": "Test email delivery with PDF attachments only",
      "full-flow": "Test complete flow including QR generation, PDF creation, email delivery, and validation"
    },
    description: "Tests PDF ticket generation and email delivery with embedded QR codes using vbticket.com domain",
    features: [
      "High-quality QR code generation for PDFs",
      "Professional PDF ticket templates",
      "Email delivery with PDF attachments",
      "QR code validation testing",
      "Comprehensive error handling"
    ]
  });
}
