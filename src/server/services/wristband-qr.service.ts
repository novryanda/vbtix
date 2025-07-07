import { prisma } from "~/server/db";
import {
  generateWristbandQRCodeData,
  generateWristbandQRCodeImage,
  generateWristbandQRCodeBuffer,
  encryptWristbandQRCodeData,
  validateWristbandQRCodeData,
  decryptWristbandQRCodeData,
  type WristbandQRData,
  type QRCodeOptions,
} from "~/lib/services/qr-code.service";
import { WristbandQRCodeStatus } from "@prisma/client";
import { generateUniqueCode } from "~/lib/utils/generators";

/**
 * Audit logging interface for wristband scan activities
 */
interface WristbandScanAuditLog {
  attemptId: string;
  wristbandId?: string;
  organizerId: string;
  eventId?: string;
  action: 'SCAN_SUCCESS' | 'SCAN_ERROR' | 'VALIDATION_FAILED';
  timestamp: Date;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Generate QR code for a wristband
 */
export async function generateWristbandQRCode(params: {
  wristbandId: string;
  organizerId: string;
}): Promise<{
  success: boolean;
  qrCodeImageUrl?: string;
  error?: string;
}> {
  try {
    // Get wristband details
    const wristband = await prisma.wristbandQRCode.findFirst({
      where: {
        id: params.wristbandId,
        organizerId: params.organizerId,
      },
      include: {
        event: true,
      },
    });

    if (!wristband) {
      return {
        success: false,
        error: "Wristband not found or access denied",
      };
    }

    // Check if QR code already generated
    if (wristband.status === WristbandQRCodeStatus.GENERATED || wristband.status === WristbandQRCodeStatus.ACTIVE) {
      return {
        success: true,
        qrCodeImageUrl: wristband.qrCodeImageUrl || undefined,
      };
    }

    // Generate QR code data
    const qrData = generateWristbandQRCodeData({
      wristbandId: wristband.id,
      eventId: wristband.eventId,
      organizerId: wristband.organizerId,
      name: wristband.name,
      validFrom: wristband.validFrom || undefined,
      validUntil: wristband.validUntil || undefined,
      isReusable: wristband.isReusable,
      maxScans: wristband.maxScans || undefined,
    });

    // Generate QR code image
    const qrCodeImageUrl = await generateWristbandQRCodeImage(qrData, {
      width: 300,
      height: 300,
      errorCorrectionLevel: "M",
    });

    // Encrypt QR data for storage
    const encryptedQRData = encryptWristbandQRCodeData(qrData);

    // Update wristband with QR code information
    const updatedWristband = await prisma.wristbandQRCode.update({
      where: { id: params.wristbandId },
      data: {
        qrCodeImageUrl,
        qrCodeData: encryptedQRData,
        qrCodeGeneratedAt: new Date(),
        status: WristbandQRCodeStatus.ACTIVE,
      },
    });

    return {
      success: true,
      qrCodeImageUrl: updatedWristband.qrCodeImageUrl || undefined,
    };
  } catch (error) {
    console.error("Error generating wristband QR code:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate QR code",
    };
  }
}

/**
 * Validate wristband QR code
 */
export async function validateWristbandQRCode(
  qrCodeData: string,
  organizerId: string
): Promise<{
  success: boolean;
  wristband?: any;
  error?: string;
}> {
  try {
    // Decrypt and validate QR code data
    const decryptedData = decryptWristbandQRCodeData(qrCodeData);
    
    if (!validateWristbandQRCodeData(decryptedData)) {
      return {
        success: false,
        error: "Invalid or corrupted QR code",
      };
    }

    // Find wristband in database
    const wristband = await prisma.wristbandQRCode.findFirst({
      where: {
        id: decryptedData.wristbandId,
        organizerId,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (!wristband) {
      return {
        success: false,
        error: "Wristband not found or access denied",
      };
    }

    // Check wristband status
    if (wristband.status !== WristbandQRCodeStatus.ACTIVE) {
      return {
        success: false,
        error: `Wristband is ${wristband.status.toLowerCase()}`,
      };
    }

    // Check scan limits
    if (wristband.maxScans && wristband.scanCount >= wristband.maxScans) {
      return {
        success: false,
        error: "Wristband scan limit exceeded",
      };
    }

    return {
      success: true,
      wristband: {
        id: wristband.id,
        name: wristband.name,
        description: wristband.description,
        eventId: wristband.eventId,
        eventTitle: wristband.event.title,
        scanCount: wristband.scanCount,
        maxScans: wristband.maxScans,
        isReusable: wristband.isReusable,
        validFrom: wristband.validFrom,
        validUntil: wristband.validUntil,
        status: wristband.status,
      },
    };
  } catch (error) {
    console.error("Error validating wristband QR code:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to validate QR code",
    };
  }
}

/**
 * Scan wristband QR code (verify authenticity and log scan)
 */
export async function scanWristbandQRCode(
  qrCodeData: string,
  organizerId: string,
  scannedBy: string,
  scanLocation?: string,
  scanDevice?: string
): Promise<{
  success: boolean;
  wristband?: any;
  scanLog?: any;
  error?: string;
}> {
  try {
    // First validate the QR code
    const validationResult = await validateWristbandQRCode(qrCodeData, organizerId);
    
    if (!validationResult.success) {
      // Log failed scan attempt
      await logWristbandScanAttempt({
        wristbandId: null,
        organizerId,
        scannedBy,
        scanResult: 'VALIDATION_FAILED',
        scanLocation,
        scanDevice,
        notes: validationResult.error,
      });

      return validationResult;
    }

    const wristband = validationResult.wristband!;

    // Increment scan count and create scan log
    const [updatedWristband, scanLog] = await prisma.$transaction([
      prisma.wristbandQRCode.update({
        where: { id: wristband.id },
        data: {
          scanCount: {
            increment: 1,
          },
        },
      }),
      prisma.wristbandScanLog.create({
        data: {
          wristbandQRId: wristband.id,
          scannedBy,
          scanResult: 'SUCCESS',
          scanLocation,
          scanDevice,
        },
      }),
    ]);

    return {
      success: true,
      wristband: {
        ...wristband,
        scanCount: updatedWristband.scanCount,
      },
      scanLog: {
        id: scanLog.id,
        scannedAt: scanLog.scannedAt,
        scanResult: scanLog.scanResult,
      },
    };
  } catch (error) {
    console.error("Error scanning wristband QR code:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to scan QR code",
    };
  }
}

/**
 * Log wristband scan attempt for audit purposes
 */
async function logWristbandScanAttempt(params: {
  wristbandId: string | null;
  organizerId: string;
  scannedBy: string;
  scanResult: string;
  scanLocation?: string;
  scanDevice?: string;
  notes?: string;
}) {
  try {
    if (params.wristbandId) {
      await prisma.wristbandScanLog.create({
        data: {
          wristbandQRId: params.wristbandId,
          scannedBy: params.scannedBy,
          scanResult: params.scanResult,
          scanLocation: params.scanLocation,
          scanDevice: params.scanDevice,
          notes: params.notes,
        },
      });
    }
    
    // Additional audit logging could be added here
    console.log(`🔍 Wristband scan attempt logged:`, {
      wristbandId: params.wristbandId,
      organizerId: params.organizerId,
      result: params.scanResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error logging wristband scan attempt:", error);
  }
}

/**
 * Create a new wristband QR code
 */
export async function createWristbandQRCode(params: {
  eventId: string;
  organizerId: string;
  name: string;
  description?: string;
  validFrom?: Date;
  validUntil?: Date;
  maxScans?: number;
  createdBy: string;
}): Promise<{
  success: boolean;
  wristband?: any;
  error?: string;
}> {
  try {
    // Verify organizer owns the event
    const event = await prisma.event.findFirst({
      where: {
        id: params.eventId,
        organizerId: params.organizerId,
      },
    });

    if (!event) {
      return {
        success: false,
        error: "Event not found or access denied",
      };
    }

    // Generate unique QR code identifier
    const qrCode = generateUniqueCode();

    // Create wristband
    const wristband = await prisma.wristbandQRCode.create({
      data: {
        eventId: params.eventId,
        organizerId: params.organizerId,
        name: params.name,
        description: params.description,
        qrCode,
        validFrom: params.validFrom,
        validUntil: params.validUntil,
        maxScans: params.maxScans,
        createdBy: params.createdBy,
        status: WristbandQRCodeStatus.PENDING,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return {
      success: true,
      wristband: {
        id: wristband.id,
        name: wristband.name,
        description: wristband.description,
        qrCode: wristband.qrCode,
        status: wristband.status,
        eventId: wristband.eventId,
        eventTitle: wristband.event.title,
        validFrom: wristband.validFrom,
        validUntil: wristband.validUntil,
        maxScans: wristband.maxScans,
        scanCount: wristband.scanCount,
        createdAt: wristband.createdAt,
      },
    };
  } catch (error) {
    console.error("Error creating wristband QR code:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create wristband",
    };
  }
}
