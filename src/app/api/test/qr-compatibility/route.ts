import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/server/db";
import { 
  generateQRCodeData, 
  generateQRCodeImage, 
  validateScannedQRCode,
  encryptQRCodeData,
  decryptQRCodeData,
  validateQRCodeData
} from "~/lib/services/qr-code.service";
import { generateTicketQRCode } from "~/server/services/ticket-qr.service";

/**
 * GET /api/test/qr-compatibility
 * Test QR code compatibility across different generation methods and formats
 */
export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Starting comprehensive QR code compatibility test...");

    // Get tickets with different QR code statuses
    const tickets = await prisma.ticket.findMany({
      where: {
        transaction: {
          status: "SUCCESS",
        },
      },
      include: {
        transaction: {
          include: {
            event: true,
          },
        },
        ticketType: true,
        user: true,
        ticketHolder: true,
      },
      take: 5,
    });

    if (tickets.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No tickets found for testing",
        message: "Please ensure there are tickets with verified payments",
      });
    }

    const testResults = [];

    for (const ticket of tickets) {
      console.log(`🎫 Testing ticket: ${ticket.id}`);
      
      const ticketTest = {
        ticketId: ticket.id,
        eventTitle: ticket.transaction.event.title,
        currentQRStatus: ticket.qrCodeStatus,
        tests: [],
      };

      // Test 1: Generate new QR code data
      try {
        const qrData = generateQRCodeData({
          ticketId: ticket.id,
          eventId: ticket.transaction.eventId,
          userId: ticket.userId,
          transactionId: ticket.transactionId,
          ticketTypeId: ticket.ticketTypeId,
          eventDate: ticket.transaction.event.startDate,
        });

        ticketTest.tests.push({
          name: "QR Data Generation",
          passed: true,
          data: {
            hasAllFields: !!(qrData.ticketId && qrData.eventId && qrData.userId && qrData.checksum),
            issuedAt: qrData.issuedAt,
            expiresAt: qrData.expiresAt,
            checksumLength: qrData.checksum.length,
          },
        });

        // Test 2: Encrypt QR data
        try {
          const encryptedData = encryptQRCodeData(qrData);
          const hasValidFormat = encryptedData.includes(':') && encryptedData.length > 32;
          
          ticketTest.tests.push({
            name: "QR Data Encryption",
            passed: hasValidFormat,
            data: {
              encryptedLength: encryptedData.length,
              hasValidFormat,
              format: encryptedData.substring(0, 20) + "...",
            },
          });

          // Test 3: Decrypt QR data
          try {
            const decryptedData = decryptQRCodeData(encryptedData);
            const dataMatches = JSON.stringify(decryptedData) === JSON.stringify(qrData);
            
            ticketTest.tests.push({
              name: "QR Data Decryption",
              passed: dataMatches,
              data: {
                dataMatches,
                decryptedTicketId: decryptedData.ticketId,
                originalTicketId: qrData.ticketId,
              },
            });

            // Test 4: Validate QR data integrity
            const isValidData = validateQRCodeData(decryptedData);
            ticketTest.tests.push({
              name: "QR Data Validation",
              passed: isValidData,
              data: {
                isValid: isValidData,
                checksumMatch: decryptedData.checksum === qrData.checksum,
              },
            });

            // Test 5: Full validation pipeline
            const fullValidation = validateScannedQRCode(encryptedData);
            ticketTest.tests.push({
              name: "Full Validation Pipeline",
              passed: fullValidation.isValid,
              data: {
                isValid: fullValidation.isValid,
                error: fullValidation.error,
                hasData: !!fullValidation.data,
              },
            });

            // Test 6: Generate QR code image
            try {
              const qrImage = await generateQRCodeImage(qrData, {
                width: 200,
                height: 200,
                errorCorrectionLevel: "M",
              });
              
              ticketTest.tests.push({
                name: "QR Image Generation",
                passed: qrImage.startsWith('data:image/png;base64,'),
                data: {
                  isDataURL: qrImage.startsWith('data:image/png;base64,'),
                  imageSize: qrImage.length,
                },
              });
            } catch (error) {
              ticketTest.tests.push({
                name: "QR Image Generation",
                passed: false,
                error: error instanceof Error ? error.message : "Unknown error",
              });
            }

          } catch (error) {
            ticketTest.tests.push({
              name: "QR Data Decryption",
              passed: false,
              error: error instanceof Error ? error.message : "Decryption failed",
            });
          }

        } catch (error) {
          ticketTest.tests.push({
            name: "QR Data Encryption",
            passed: false,
            error: error instanceof Error ? error.message : "Encryption failed",
          });
        }

      } catch (error) {
        ticketTest.tests.push({
          name: "QR Data Generation",
          passed: false,
          error: error instanceof Error ? error.message : "Generation failed",
        });
      }

      // Test 7: Service-level QR generation
      try {
        const serviceResult = await generateTicketQRCode(ticket.id);
        ticketTest.tests.push({
          name: "Service QR Generation",
          passed: serviceResult.success,
          data: {
            success: serviceResult.success,
            hasImageUrl: !!serviceResult.qrCodeImageUrl,
            error: serviceResult.error,
          },
        });
      } catch (error) {
        ticketTest.tests.push({
          name: "Service QR Generation",
          passed: false,
          error: error instanceof Error ? error.message : "Service generation failed",
        });
      }

      testResults.push(ticketTest);
    }

    // Calculate overall statistics
    const totalTests = testResults.reduce((sum, ticket) => sum + ticket.tests.length, 0);
    const passedTests = testResults.reduce((sum, ticket) => 
      sum + ticket.tests.filter(test => test.passed).length, 0
    );
    const failedTests = totalTests - passedTests;

    console.log(`✅ QR compatibility test completed: ${passedTests}/${totalTests} tests passed`);

    return NextResponse.json({
      success: true,
      message: "QR code compatibility test completed",
      data: {
        summary: {
          totalTickets: tickets.length,
          totalTests,
          passedTests,
          failedTests,
          successRate: Math.round((passedTests / totalTests) * 100),
        },
        tickets: testResults,
        recommendations: generateRecommendations(testResults),
      },
    });

  } catch (error) {
    console.error("💥 QR compatibility test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Test failed",
      },
      { status: 500 }
    );
  }
}

/**
 * Generate recommendations based on test results
 */
function generateRecommendations(testResults: any[]): string[] {
  const recommendations = [];
  
  const failedTests = testResults.flatMap(ticket => 
    ticket.tests.filter(test => !test.passed)
  );

  if (failedTests.length === 0) {
    recommendations.push("✅ All QR code compatibility tests passed! The system is working correctly.");
  } else {
    const failureTypes = failedTests.reduce((acc, test) => {
      acc[test.name] = (acc[test.name] || 0) + 1;
      return acc;
    }, {});

    for (const [testName, count] of Object.entries(failureTypes)) {
      recommendations.push(`⚠️ ${testName} failed ${count} time(s) - investigate this component`);
    }

    if (failureTypes["QR Data Generation"]) {
      recommendations.push("🔧 Check QR data generation logic and required fields");
    }
    
    if (failureTypes["QR Data Encryption"] || failureTypes["QR Data Decryption"]) {
      recommendations.push("🔐 Verify encryption/decryption keys and algorithms");
    }
    
    if (failureTypes["QR Image Generation"]) {
      recommendations.push("🖼️ Check QR code image generation dependencies and settings");
    }
    
    if (failureTypes["Service QR Generation"]) {
      recommendations.push("🔧 Review ticket QR service and database operations");
    }
  }

  return recommendations;
}

/**
 * POST /api/test/qr-compatibility
 * Test specific QR code data for compatibility
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, regenerate = false } = body;

    if (!ticketId) {
      return NextResponse.json(
        {
          success: false,
          error: "ticketId is required",
        },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        transaction: {
          include: {
            event: true,
          },
        },
        ticketType: true,
        user: true,
        ticketHolder: true,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          error: "Ticket not found",
        },
        { status: 404 }
      );
    }

    let result;
    if (regenerate) {
      result = await generateTicketQRCode(ticketId);
    } else {
      // Test existing QR code
      if (ticket.qrCodeData) {
        const validation = validateScannedQRCode(ticket.qrCodeData);
        result = {
          success: validation.isValid,
          error: validation.error,
          qrCodeImageUrl: ticket.qrCodeImageUrl,
        };
      } else {
        result = {
          success: false,
          error: "No QR code data found",
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: regenerate ? "QR code regeneration test completed" : "QR code compatibility test completed",
      data: {
        ticket: {
          id: ticket.id,
          qrCodeStatus: ticket.qrCodeStatus,
          hasQRData: !!ticket.qrCodeData,
          hasQRImage: !!ticket.qrCodeImageUrl,
        },
        result,
      },
    });

  } catch (error) {
    console.error("QR compatibility test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Test failed",
      },
      { status: 500 }
    );
  }
}
