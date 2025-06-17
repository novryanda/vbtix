import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/server/db";
import { 
  generateQRCodeData, 
  encryptQRCodeData,
  validateScannedQRCode,
  generateQRCodeImage
} from "~/lib/services/qr-code.service";

/**
 * POST /api/admin/qr-migration
 * Migrate existing QR codes to the new encryption format
 */
export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Starting QR code migration...");

    // Get all tickets with QR codes that need migration
    const tickets = await prisma.ticket.findMany({
      where: {
        qrCodeData: {
          not: null,
        },
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
    });

    console.log(`📊 Found ${tickets.length} tickets with QR codes to check`);

    const migrationResults = {
      total: tickets.length,
      alreadyValid: 0,
      migrated: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const ticket of tickets) {
      try {
        console.log(`🎫 Checking ticket: ${ticket.id}`);

        // Test if existing QR code is valid
        const existingQRValid = validateScannedQRCode(ticket.qrCodeData!);
        
        if (existingQRValid.isValid) {
          console.log(`✅ Ticket ${ticket.id} QR code is already valid`);
          migrationResults.alreadyValid++;
          continue;
        }

        console.log(`🔄 Migrating QR code for ticket: ${ticket.id}`);

        // Generate new QR code data
        const newQRData = generateQRCodeData({
          ticketId: ticket.id,
          eventId: ticket.transaction.eventId,
          userId: ticket.userId,
          transactionId: ticket.transactionId,
          ticketTypeId: ticket.ticketTypeId,
          eventDate: ticket.transaction.event.startDate,
        });

        // Encrypt with current method
        const newEncryptedData = encryptQRCodeData(newQRData);

        // Generate new QR code image
        const newQRImage = await generateQRCodeImage(newQRData, {
          width: 300,
          height: 300,
          errorCorrectionLevel: "M",
        });

        // Update ticket in database
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            qrCodeData: newEncryptedData,
            qrCodeImageUrl: newQRImage,
            qrCodeGeneratedAt: new Date(),
            qrCodeStatus: "ACTIVE",
          },
        });

        console.log(`✅ Successfully migrated QR code for ticket: ${ticket.id}`);
        migrationResults.migrated++;

      } catch (error) {
        const errorMessage = `Failed to migrate ticket ${ticket.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`❌ ${errorMessage}`);
        migrationResults.failed++;
        migrationResults.errors.push(errorMessage);
      }
    }

    console.log(`🎉 QR code migration completed:`, migrationResults);

    return NextResponse.json({
      success: true,
      message: "QR code migration completed",
      data: migrationResults,
    });

  } catch (error) {
    console.error("💥 QR code migration failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Migration failed",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/qr-migration
 * Check QR code migration status
 */
export async function GET() {
  try {
    console.log("📊 Checking QR code migration status...");

    // Get all tickets with QR codes
    const allTickets = await prisma.ticket.findMany({
      where: {
        qrCodeData: {
          not: null,
        },
        transaction: {
          status: "SUCCESS",
        },
      },
      select: {
        id: true,
        qrCodeData: true,
        qrCodeGeneratedAt: true,
        qrCodeStatus: true,
      },
    });

    const status = {
      total: allTickets.length,
      valid: 0,
      invalid: 0,
      needsMigration: 0,
      samples: {
        valid: [] as string[],
        invalid: [] as string[],
      },
    };

    for (const ticket of allTickets) {
      try {
        const validation = validateScannedQRCode(ticket.qrCodeData!);
        if (validation.isValid) {
          status.valid++;
          if (status.samples.valid.length < 3) {
            status.samples.valid.push(ticket.id);
          }
        } else {
          status.invalid++;
          status.needsMigration++;
          if (status.samples.invalid.length < 3) {
            status.samples.invalid.push(ticket.id);
          }
        }
      } catch (error) {
        status.invalid++;
        status.needsMigration++;
        if (status.samples.invalid.length < 3) {
          status.samples.invalid.push(ticket.id);
        }
      }
    }

    console.log("📊 QR code status:", status);

    return NextResponse.json({
      success: true,
      message: "QR code migration status retrieved",
      data: status,
    });

  } catch (error) {
    console.error("💥 Failed to check QR code status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Status check failed",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/qr-migration
 * Test QR code validation for specific tickets
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketIds = searchParams.get('ticketIds')?.split(',') || [];

    if (ticketIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No ticket IDs provided",
        },
        { status: 400 }
      );
    }

    console.log(`🧪 Testing QR validation for tickets: ${ticketIds.join(', ')}`);

    const testResults = [];

    for (const ticketId of ticketIds) {
      try {
        const ticket = await prisma.ticket.findUnique({
          where: { id: ticketId },
          select: {
            id: true,
            qrCodeData: true,
            qrCodeStatus: true,
          },
        });

        if (!ticket) {
          testResults.push({
            ticketId,
            success: false,
            error: "Ticket not found",
          });
          continue;
        }

        if (!ticket.qrCodeData) {
          testResults.push({
            ticketId,
            success: false,
            error: "No QR code data",
          });
          continue;
        }

        const validation = validateScannedQRCode(ticket.qrCodeData);
        testResults.push({
          ticketId,
          success: true,
          isValid: validation.isValid,
          error: validation.error,
          qrCodeStatus: ticket.qrCodeStatus,
        });

      } catch (error) {
        testResults.push({
          ticketId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "QR code validation test completed",
      data: testResults,
    });

  } catch (error) {
    console.error("💥 QR code validation test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Test failed",
      },
      { status: 500 }
    );
  }
}
