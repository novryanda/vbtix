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
import { validateTicketQRCode, checkInTicketWithQR } from "~/server/services/ticket-qr.service";
import { env } from "~/env";

/**
 * GET /api/test/qr-scanner-validation
 * Test QR code scanner validation with comprehensive diagnostics
 */
export async function GET() {
  try {
    console.log("🧪 Starting comprehensive QR scanner diagnostic test...");

    // Test 1: Environment and Configuration Check
    const envCheck = {
      hasEncryptionKey: !!env.QR_CODE_ENCRYPTION_KEY,
      keyLength: env.QR_CODE_ENCRYPTION_KEY?.length || 0,
      keyPreview: env.QR_CODE_ENCRYPTION_KEY?.substring(0, 8) + "..." || "NOT_SET",
    };
    console.log("🔧 Environment check:", envCheck);

    // Get a real ticket with verified payment
    const ticket = await prisma.ticket.findFirst({
      where: {
        transaction: {
          status: "SUCCESS",
        },
        qrCodeStatus: "ACTIVE",
        checkedIn: false,
      },
      include: {
        transaction: {
          include: {
            event: {
              include: {
                organizer: true,
              },
            },
          },
        },
        ticketType: true,
        user: true,
        ticketHolder: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({
        success: false,
        error: "No suitable test ticket found",
        message: "Please ensure there's at least one ticket with verified payment and active QR code",
        envCheck,
      });
    }

    console.log(`🎫 Found test ticket: ${ticket.id} for event: ${ticket.transaction.event.title}`);

    // Test 2: Generate fresh QR code data
    const qrData = generateQRCodeData({
      ticketId: ticket.id,
      eventId: ticket.transaction.eventId,
      userId: ticket.userId,
      transactionId: ticket.transactionId,
      ticketTypeId: ticket.ticketTypeId,
      eventDate: ticket.transaction.event.startDate,
    });

    console.log("✅ QR code data generated successfully:", {
      ticketId: qrData.ticketId,
      issuedAt: qrData.issuedAt,
      expiresAt: qrData.expiresAt,
      checksumLength: qrData.checksum.length,
    });

    // Test 3: Encrypt QR code data with detailed logging
    let encryptedData: string;
    let encryptionDetails: any;
    try {
      encryptedData = encryptQRCodeData(qrData);
      const parts = encryptedData.split(":");
      encryptionDetails = {
        success: true,
        totalLength: encryptedData.length,
        ivLength: parts[0]?.length || 0,
        encryptedLength: parts[1]?.length || 0,
        hasValidFormat: parts.length === 2 && parts[0] && parts[1],
        preview: encryptedData.substring(0, 50) + "...",
      };
      console.log("✅ QR code data encrypted successfully:", encryptionDetails);
    } catch (error) {
      console.error("❌ Encryption failed:", error);
      return NextResponse.json({
        success: false,
        error: "QR code encryption failed",
        details: error instanceof Error ? error.message : "Unknown encryption error",
        envCheck,
      });
    }

    // Test 4: Test decryption step by step
    let decryptionTest: any;
    try {
      console.log("🔍 Testing decryption step by step...");
      const decryptedData = decryptQRCodeData(encryptedData);

      decryptionTest = {
        success: true,
        dataMatches: JSON.stringify(decryptedData) === JSON.stringify(qrData),
        originalTicketId: qrData.ticketId,
        decryptedTicketId: decryptedData.ticketId,
        originalChecksum: qrData.checksum,
        decryptedChecksum: decryptedData.checksum,
        fieldsMatch: {
          ticketId: decryptedData.ticketId === qrData.ticketId,
          eventId: decryptedData.eventId === qrData.eventId,
          userId: decryptedData.userId === qrData.userId,
          checksum: decryptedData.checksum === qrData.checksum,
        },
      };
      console.log("✅ Decryption test successful:", decryptionTest);
    } catch (error) {
      console.error("❌ Decryption failed:", error);
      decryptionTest = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown decryption error",
        errorStack: error instanceof Error ? error.stack : undefined,
      };
    }

    // Test 5: Test data validation
    let dataValidationTest: any;
    try {
      if (decryptionTest.success) {
        const decryptedData = decryptQRCodeData(encryptedData);
        const isValid = validateQRCodeData(decryptedData);
        dataValidationTest = {
          success: true,
          isValid,
          expirationCheck: decryptedData.expiresAt ? {
            expiresAt: decryptedData.expiresAt,
            now: new Date().toISOString(),
            isExpired: decryptedData.expiresAt ? new Date() > new Date(decryptedData.expiresAt) : false,
          } : null,
        };
      } else {
        dataValidationTest = {
          success: false,
          error: "Cannot validate data due to decryption failure",
        };
      }
      console.log("🔍 Data validation test:", dataValidationTest);
    } catch (error) {
      dataValidationTest = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown validation error",
      };
    }

    // Test 6: Full validation pipeline
    let fullValidationTest: any;
    try {
      const validation = validateScannedQRCode(encryptedData);
      fullValidationTest = {
        success: true,
        isValid: validation.isValid,
        error: validation.error,
        hasData: !!validation.data,
        dataMatches: validation.data ? {
          ticketId: validation.data.ticketId === ticket.id,
          eventId: validation.data.eventId === ticket.transaction.eventId,
          userId: validation.data.userId === ticket.userId,
        } : null,
      };
      console.log("🔍 Full validation pipeline test:", fullValidationTest);
    } catch (error) {
      fullValidationTest = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown validation error",
      };
    }

    // Test 7: Test ticket validation service
    let ticketValidationTest: any;
    try {
      const ticketValidation = await validateTicketQRCode(encryptedData, ticket.transaction.event.organizer.id);
      ticketValidationTest = {
        success: true,
        isValid: ticketValidation.isValid,
        error: ticketValidation.error,
        errorCode: ticketValidation.errorCode,
        hasTicketData: !!ticketValidation.ticket,
      };
      console.log("🔍 Ticket validation service test:", ticketValidationTest);
    } catch (error) {
      ticketValidationTest = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown service error",
      };
    }

    // Test 8: Test with existing QR code from database
    let existingQRTest: any;
    try {
      if (ticket.qrCodeData) {
        console.log("🔍 Testing existing QR code from database...");
        const existingValidation = validateScannedQRCode(ticket.qrCodeData);
        existingQRTest = {
          success: true,
          hasExistingQR: true,
          isValid: existingValidation.isValid,
          error: existingValidation.error,
          dataLength: ticket.qrCodeData.length,
          preview: ticket.qrCodeData.substring(0, 50) + "...",
        };
      } else {
        existingQRTest = {
          success: true,
          hasExistingQR: false,
          message: "No existing QR code in database",
        };
      }
      console.log("🔍 Existing QR test:", existingQRTest);
    } catch (error) {
      existingQRTest = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown existing QR error",
      };
    }

    // Test 9: Generate QR code image
    let qrImageTest: any;
    try {
      const qrCodeImage = await generateQRCodeImage(qrData, {
        width: 300,
        height: 300,
        errorCorrectionLevel: "M",
      });
      qrImageTest = {
        success: true,
        isDataURL: qrCodeImage.startsWith('data:image/png;base64,'),
        imageSize: qrCodeImage.length,
        preview: qrCodeImage.substring(0, 50) + "...",
      };
      console.log("✅ QR code image generated successfully");
    } catch (error) {
      qrImageTest = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown image generation error",
      };
    }

    // Test 10: Test different error scenarios
    const errorTests = await testErrorScenarios(ticket.transaction.event.organizer.id);

    return NextResponse.json({
      success: true,
      message: "QR scanner diagnostic test completed",
      data: {
        envCheck,
        ticket: {
          id: ticket.id,
          eventTitle: ticket.transaction.event.title,
          attendeeName: ticket.ticketHolder?.fullName || ticket.user.name,
          ticketType: ticket.ticketType.name,
          qrCodeStatus: ticket.qrCodeStatus,
          hasExistingQR: !!ticket.qrCodeData,
        },
        qrData: {
          ticketId: qrData.ticketId,
          eventId: qrData.eventId,
          issuedAt: qrData.issuedAt,
          expiresAt: qrData.expiresAt,
          checksum: qrData.checksum,
        },
        tests: {
          encryption: encryptionDetails,
          decryption: decryptionTest,
          dataValidation: dataValidationTest,
          fullValidation: fullValidationTest,
          ticketValidation: ticketValidationTest,
          existingQR: existingQRTest,
          qrImage: qrImageTest,
          errorScenarios: errorTests,
        },
      },
    });
  } catch (error) {
    console.error("💥 QR scanner validation test failed:", error);
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
 * Test various error scenarios
 */
async function testErrorScenarios(organizerId: string) {
  const tests = [];

  // Test 1: Invalid QR data format
  try {
    const result = await validateTicketQRCode("invalid-qr-data", organizerId);
    tests.push({
      name: "Invalid QR Data Format",
      passed: !result.isValid && result.errorCode === "INVALID_INPUT",
      errorCode: result.errorCode,
      error: result.error,
    });
  } catch (error) {
    tests.push({
      name: "Invalid QR Data Format",
      passed: false,
      error: "Test threw exception",
    });
  }

  // Test 2: Malformed encrypted data
  try {
    const result = await validateTicketQRCode("malformed:encrypted:data", organizerId);
    tests.push({
      name: "Malformed Encrypted Data",
      passed: !result.isValid && result.errorCode === "DECRYPTION_FAILED",
      errorCode: result.errorCode,
      error: result.error,
    });
  } catch (error) {
    tests.push({
      name: "Malformed Encrypted Data",
      passed: false,
      error: "Test threw exception",
    });
  }

  // Test 3: Non-existent ticket ID
  try {
    const fakeQRData = generateQRCodeData({
      ticketId: "fake_ticket_id_12345",
      eventId: "fake_event_id",
      userId: "fake_user_id",
      transactionId: "fake_transaction_id",
      ticketTypeId: "fake_ticket_type_id",
    });
    const encryptedFakeData = encryptQRCodeData(fakeQRData);
    const result = await validateTicketQRCode(encryptedFakeData, organizerId);
    tests.push({
      name: "Non-existent Ticket",
      passed: !result.isValid && result.errorCode === "TICKET_NOT_FOUND",
      errorCode: result.errorCode,
      error: result.error,
    });
  } catch (error) {
    tests.push({
      name: "Non-existent Ticket",
      passed: false,
      error: "Test threw exception",
    });
  }

  return tests;
}

/**
 * POST /api/test/qr-scanner-validation
 * Test QR code validation with provided encrypted data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { encryptedData, organizerId, testCheckIn = false } = body;

    if (!encryptedData) {
      return NextResponse.json(
        {
          success: false,
          error: "encryptedData is required",
        },
        { status: 400 }
      );
    }

    console.log(`🧪 Testing QR validation with organizer: ${organizerId}`);

    // Test validation
    const validationResult = await validateTicketQRCode(encryptedData, organizerId);

    let checkInResult = null;
    if (testCheckIn && validationResult.isValid && organizerId) {
      console.log("🧪 Testing check-in process...");
      checkInResult = await checkInTicketWithQR(encryptedData, organizerId);
    }

    return NextResponse.json({
      success: true,
      message: "QR code validation test completed",
      data: {
        validation: validationResult,
        checkIn: checkInResult,
      },
    });
  } catch (error) {
    console.error("QR code validation test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Validation test failed",
      },
      { status: 500 }
    );
  }
}
