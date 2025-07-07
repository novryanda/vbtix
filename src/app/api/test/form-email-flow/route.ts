import { NextRequest, NextResponse } from "next/server";
import { emailService } from "~/lib/email-service";

/**
 * POST /api/test/form-email-flow
 * Test form submission to email delivery flow
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      testType = "contact", 
      email = "novryandareza0@gmail.com",
      name = "Test User",
      formData = {}
    } = body;

    console.log(`🧪 Testing form-to-email flow: ${testType} for ${email}`);

    const testResults: any = {
      testType,
      email,
      timestamp: new Date().toISOString(),
      tests: {},
    };

    switch (testType) {
      case "contact":
        // Test contact form submission
        console.log("📧 Testing contact form email flow...");
        try {
          const contactFormData = {
            name: formData.name || name,
            email: formData.email || email,
            subject: formData.subject || "Test Contact Form Submission",
            message: formData.message || "This is a test message from the contact form to verify email delivery is working correctly.",
            phone: formData.phone || "+62812345678",
          };

          // Simulate contact form API call
          const contactResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/contact`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactFormData),
          });

          const contactResult = await contactResponse.json();

          testResults.tests.contactForm = {
            success: contactResponse.ok,
            data: contactResult,
            formData: contactFormData,
          };
        } catch (error: any) {
          testResults.tests.contactForm = {
            success: false,
            error: error.message,
          };
        }
        break;

      case "registration":
        // Test registration verification email
        console.log("📧 Testing registration verification email...");
        try {
          const verificationResult = await emailService.sendAccountVerification({
            to: email,
            userName: name,
            verificationUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/verify?token=test-token-${Date.now()}`,
          });

          testResults.tests.registrationVerification = {
            success: verificationResult.success,
            data: verificationResult,
          };
        } catch (error: any) {
          testResults.tests.registrationVerification = {
            success: false,
            error: error.message,
          };
        }
        break;

      case "ticket":
        // Test ticket delivery email with real QR code generation
        console.log("📧 Testing ticket delivery email with QR code generation...");
        try {
          // Import QR code generation services
          const { generateQRCodeData, generateQRCodeImage } = await import("~/lib/services/qr-code.service");

          // Generate a real QR code for testing
          const qrData = generateQRCodeData({
            ticketId: `test-ticket-${Date.now()}`,
            eventId: `test-event-${Date.now()}`,
            userId: `test-user-${Date.now()}`,
            transactionId: `test-transaction-${Date.now()}`,
            ticketTypeId: `test-ticket-type-${Date.now()}`,
            eventDate: new Date("2025-01-20"),
          });

          const qrCodeImage = await generateQRCodeImage(qrData, {
            width: 300,
            height: 300,
            errorCorrectionLevel: "M",
          });

          const ticketResult = await emailService.sendTicketDelivery({
            to: email,
            customerName: name,
            event: {
              title: "Test Event - Form Email Flow",
              date: "2025-01-20",
              time: "19:00",
              location: "Test Venue",
              address: "Test Address, Test City, Test Province",
            },
            order: {
              invoiceNumber: `TEST-FORM-${Date.now()}`,
              totalAmount: 150000,
              paymentDate: new Date().toLocaleDateString('id-ID'),
            },
            tickets: [
              {
                id: `test-ticket-${Date.now()}`,
                ticketNumber: `TKT-FORM-001`,
                ticketType: "Regular",
                holderName: name,
                qrCode: qrCodeImage, // Use real generated QR code
              },
            ],
          });

          testResults.tests.ticketDelivery = {
            success: ticketResult.success,
            data: ticketResult,
            qrCodeGenerated: !!qrCodeImage,
            qrCodeLength: qrCodeImage?.length || 0,
          };
        } catch (error: any) {
          testResults.tests.ticketDelivery = {
            success: false,
            error: error.message,
          };
        }
        break;

      case "all":
        // Test all form types
        console.log("📧 Testing all form email flows...");
        
        // Contact form test
        try {
          const contactFormData = {
            name,
            email,
            subject: "Test All Forms - Contact",
            message: "Testing contact form email delivery as part of comprehensive form testing.",
            phone: "+62812345678",
          };

          const contactResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/contact`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactFormData),
          });

          const contactResult = await contactResponse.json();
          testResults.tests.contactForm = {
            success: contactResponse.ok,
            data: contactResult,
          };
        } catch (error: any) {
          testResults.tests.contactForm = {
            success: false,
            error: error.message,
          };
        }

        // Registration verification test
        try {
          const verificationResult = await emailService.sendAccountVerification({
            to: email,
            userName: name,
            verificationUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/verify?token=test-all-${Date.now()}`,
          });

          testResults.tests.registrationVerification = {
            success: verificationResult.success,
            data: verificationResult,
          };
        } catch (error: any) {
          testResults.tests.registrationVerification = {
            success: false,
            error: error.message,
          };
        }

        // Ticket delivery test with real QR code
        try {
          // Import QR code generation services
          const { generateQRCodeData, generateQRCodeImage } = await import("~/lib/services/qr-code.service");

          // Generate a real QR code for testing
          const qrData = generateQRCodeData({
            ticketId: `test-all-ticket-${Date.now()}`,
            eventId: `test-all-event-${Date.now()}`,
            userId: `test-all-user-${Date.now()}`,
            transactionId: `test-all-transaction-${Date.now()}`,
            ticketTypeId: `test-all-ticket-type-${Date.now()}`,
            eventDate: new Date("2025-01-25"),
          });

          const qrCodeImage = await generateQRCodeImage(qrData, {
            width: 300,
            height: 300,
            errorCorrectionLevel: "M",
          });

          const ticketResult = await emailService.sendTicketDelivery({
            to: email,
            customerName: name,
            event: {
              title: "Test Event - All Forms",
              date: "2025-01-25",
              time: "20:00",
              location: "Test Venue All",
              address: "Test Address All, Test City, Test Province",
            },
            order: {
              invoiceNumber: `TEST-ALL-${Date.now()}`,
              totalAmount: 200000,
              paymentDate: new Date().toLocaleDateString('id-ID'),
            },
            tickets: [
              {
                id: `test-all-ticket-${Date.now()}`,
                ticketNumber: `TKT-ALL-001`,
                ticketType: "VIP",
                holderName: name,
                qrCode: qrCodeImage, // Use real generated QR code
              },
            ],
          });

          testResults.tests.ticketDelivery = {
            success: ticketResult.success,
            data: ticketResult,
            qrCodeGenerated: !!qrCodeImage,
            qrCodeLength: qrCodeImage?.length || 0,
          };
        } catch (error: any) {
          testResults.tests.ticketDelivery = {
            success: false,
            error: error.message,
          };
        }
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid test type. Use: contact, registration, ticket, or all",
          },
          { status: 400 }
        );
    }

    // Calculate overall success
    const allTests = Object.values(testResults.tests);
    const successfulTests = allTests.filter((test: any) => test.success);
    const overallSuccess = successfulTests.length === allTests.length;

    console.log(`🎯 Form email flow test completed: ${successfulTests.length}/${allTests.length} successful`);

    return NextResponse.json({
      success: overallSuccess,
      message: `Form email flow test completed: ${successfulTests.length}/${allTests.length} tests passed`,
      results: testResults,
      summary: {
        totalTests: allTests.length,
        successfulTests: successfulTests.length,
        failedTests: allTests.length - successfulTests.length,
        overallSuccess,
      },
    });
  } catch (error: any) {
    console.error("❌ Form email flow test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/test/form-email-flow
 * Get information about available form email tests
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Form email flow testing endpoint",
    availableTests: [
      {
        type: "contact",
        description: "Test contact form submission and email delivery",
      },
      {
        type: "registration",
        description: "Test registration verification email",
      },
      {
        type: "ticket",
        description: "Test ticket delivery email",
      },
      {
        type: "all",
        description: "Test all form email flows",
      },
    ],
    usage: {
      method: "POST",
      body: {
        testType: "contact|registration|ticket|all",
        email: "your-email@example.com",
        name: "Your Name",
        formData: "Optional form-specific data",
      },
    },
    timestamp: new Date().toISOString(),
  });
}
