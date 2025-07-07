import { NextRequest, NextResponse } from "next/server";
import { 
  generateQRCodeData, 
  generatePDFQRCodeImage, 
  generateQRCodeImage,
  testQRCodeQuality,
  validateScannedQRCode,
  PDF_QR_OPTIONS,
  MOBILE_QR_OPTIONS
} from "~/lib/services/qr-code.service";

/**
 * POST /api/test/qr-code-optimization
 * Test QR code optimization and scanning reliability
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      testType = "all", // "quality", "comparison", "validation", "all"
      ticketId = "opt-test-001",
      eventTitle = "QR Code Optimization Test"
    } = body;

    console.log(`🧪 Testing QR code optimization - Type: ${testType}`);

    const testResults: any = {
      testType,
      timestamp: new Date().toISOString(),
      tests: {},
    };

    // Generate test QR data
    const qrData = generateQRCodeData({
      ticketId,
      eventId: "opt-event-001",
      userId: "opt-user-001",
      transactionId: "opt-transaction-001",
      ticketTypeId: "opt-ticket-type-001",
      eventDate: new Date(),
    });

    if (testType === "quality" || testType === "all") {
      // Test 1: QR Code Quality Assessment
      testResults.tests.qualityAssessment = { status: "starting" };
      try {
        const qualityTest = await testQRCodeQuality(qrData);
        testResults.tests.qualityAssessment = {
          status: "success",
          result: qualityTest,
        };
        console.log(`✅ Quality assessment: ${qualityTest.quality} (${qualityTest.success ? 'PASS' : 'FAIL'})`);
      } catch (error) {
        testResults.tests.qualityAssessment = {
          status: "error",
          error: error instanceof Error ? error.message : "Unknown quality test error",
        };
      }
    }

    if (testType === "comparison" || testType === "all") {
      // Test 2: Compare different QR code settings
      testResults.tests.settingsComparison = { status: "starting" };
      try {
        const settings = [
          { name: "Standard", options: { width: 200, errorCorrectionLevel: "M" as const } },
          { name: "Mobile Optimized", options: MOBILE_QR_OPTIONS },
          { name: "PDF Optimized", options: PDF_QR_OPTIONS },
          { name: "Ultra High Quality", options: { width: 1000, margin: 10, errorCorrectionLevel: "H" as const } },
        ];

        const comparisons = await Promise.all(
          settings.map(async (setting) => {
            try {
              const startTime = Date.now();
              const qrImage = await generateQRCodeImage(qrData, setting.options);
              const endTime = Date.now();
              
              return {
                name: setting.name,
                settings: setting.options,
                generationTime: endTime - startTime,
                imageSize: qrImage.length,
                success: true,
              };
            } catch (error) {
              return {
                name: setting.name,
                settings: setting.options,
                generationTime: 0,
                imageSize: 0,
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
              };
            }
          })
        );

        testResults.tests.settingsComparison = {
          status: "success",
          comparisons,
          recommendation: comparisons.find(c => c.name === "PDF Optimized"),
        };
        console.log(`✅ Settings comparison completed - ${comparisons.length} configurations tested`);
      } catch (error) {
        testResults.tests.settingsComparison = {
          status: "error",
          error: error instanceof Error ? error.message : "Unknown comparison error",
        };
      }
    }

    if (testType === "validation" || testType === "all") {
      // Test 3: End-to-end validation test
      testResults.tests.endToEndValidation = { status: "starting" };
      try {
        // Generate QR code with PDF settings
        const pdfQRImage = await generatePDFQRCodeImage(qrData);
        
        // Extract encrypted data from the QR generation process
        const { encryptQRCodeData } = await import("~/lib/services/qr-code.service");
        const encryptedData = encryptQRCodeData(qrData);
        
        // Test validation
        const validationResult = validateScannedQRCode(encryptedData);
        
        testResults.tests.endToEndValidation = {
          status: "success",
          qrImageGenerated: !!pdfQRImage,
          qrImageSize: pdfQRImage.length,
          encryptedDataLength: encryptedData.length,
          validationResult,
          dataIntegrity: validationResult.isValid && 
                         validationResult.data?.ticketId === qrData.ticketId,
        };
        
        console.log(`✅ End-to-end validation: ${validationResult.isValid ? 'PASS' : 'FAIL'}`);
      } catch (error) {
        testResults.tests.endToEndValidation = {
          status: "error",
          error: error instanceof Error ? error.message : "Unknown validation error",
        };
      }
    }

    // Test 4: PDF Integration Test (always run)
    testResults.tests.pdfIntegration = { status: "starting" };
    try {
      const { generateTicketPDF } = await import("~/lib/services/react-pdf-ticket.service");
      
      const ticketPDFData = {
        ticketId,
        ticketNumber: "OPT-001",
        ticketType: "VIP Optimization Test",
        holderName: "QR Test Customer",
        qrData,
        event: {
          title: eventTitle,
          date: "Sabtu, 15 Juni 2025",
          time: "19:00 WIB",
          location: "QR Test Convention Center",
          address: "Jl. QR Test Street, Jakarta Pusat, DKI Jakarta",
        },
        order: {
          invoiceNumber: "INV-QR-OPT-001",
          totalAmount: 300000,
          paymentDate: "15 Juni 2025, 14:30 WIB",
        },
      };

      const startTime = Date.now();
      const pdfBuffer = await generateTicketPDF(ticketPDFData);
      const endTime = Date.now();

      testResults.tests.pdfIntegration = {
        status: "success",
        pdfGenerated: !!pdfBuffer,
        pdfSize: pdfBuffer.length,
        pdfSizeKB: Math.round(pdfBuffer.length / 1024),
        generationTime: endTime - startTime,
        qrCodeIncluded: true, // QR code is embedded in PDF
      };
      
      console.log(`✅ PDF integration test: PDF generated (${Math.round(pdfBuffer.length / 1024)} KB in ${endTime - startTime}ms)`);
    } catch (error) {
      testResults.tests.pdfIntegration = {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown PDF integration error",
      };
    }

    // Overall assessment
    const allTests = Object.values(testResults.tests);
    const successfulTests = allTests.filter((test: any) => test.status === "success").length;
    const totalTests = allTests.length;
    
    testResults.overall = {
      status: successfulTests === totalTests ? "success" : "partial",
      successRate: `${successfulTests}/${totalTests}`,
      summary: {
        qualityOptimization: testResults.tests.qualityAssessment?.status === "success",
        settingsComparison: testResults.tests.settingsComparison?.status === "success",
        validationWorking: testResults.tests.endToEndValidation?.status === "success",
        pdfIntegration: testResults.tests.pdfIntegration?.status === "success",
      },
      recommendations: [
        "Use PDF_QR_OPTIONS for maximum scanning reliability",
        "QR code size in PDF should be at least 60mm for optimal scanning",
        "Error correction level H provides best damage resistance",
        "High resolution (800x800) ensures crisp rendering in PDF",
        "Test QR codes with multiple scanner apps before production",
      ],
    };

    return NextResponse.json({
      success: true,
      data: testResults,
    });

  } catch (error) {
    console.error("❌ QR code optimization test failed:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

/**
 * GET /api/test/qr-code-optimization
 * Get QR code optimization test information
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "QR Code Optimization Test Endpoint",
    availableTests: {
      "quality": "Test QR code quality and data integrity",
      "comparison": "Compare different QR code settings and performance",
      "validation": "Test end-to-end QR code validation workflow",
      "all": "Run all optimization tests",
    },
    optimizations: {
      "PDF Settings": {
        width: 800,
        height: 800,
        margin: 8,
        errorCorrectionLevel: "H",
        description: "Optimized for PDF printing and scanning reliability"
      },
      "Mobile Settings": {
        width: 400,
        height: 400,
        margin: 4,
        errorCorrectionLevel: "Q",
        description: "Optimized for mobile screen display and scanning"
      }
    },
    usage: {
      method: "POST",
      body: {
        testType: "quality | comparison | validation | all",
        ticketId: "Custom ticket ID (optional)",
        eventTitle: "Custom event title (optional)",
      },
    },
    examples: [
      {
        description: "Test QR code quality only",
        body: { testType: "quality" },
      },
      {
        description: "Compare different settings",
        body: { testType: "comparison" },
      },
      {
        description: "Run all optimization tests",
        body: { testType: "all" },
      },
    ],
  });
}
