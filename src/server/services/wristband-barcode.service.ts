import { prisma } from "~/server/db";
import {
  generateWristbandBarcodeData,
  generateBarcodeValue,
  generateBarcodeImageServer,
  encryptWristbandBarcodeData,
  validateWristbandBarcodeData,
  decryptWristbandBarcodeData,
  parseBarcodeValue,
  PRINT_BARCODE_OPTIONS,
  type WristbandBarcodeData,
  type BarcodeOptions,
} from "~/lib/services/barcode.service";
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
 * Generate barcode for a wristband
 */
export async function generateWristbandBarcode(params: {
  wristbandId: string;
  organizerId: string;
}): Promise<{
  success: boolean;
  barcodeImageUrl?: string;
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

    // Check if barcode already generated
    if (wristband.barcodeImageUrl && wristband.codeType === "BARCODE") {
      return {
        success: true,
        barcodeImageUrl: wristband.barcodeImageUrl,
      };
    }

    // Generate barcode data
    const barcodeData = generateWristbandBarcodeData({
      wristbandId: wristband.id,
      eventId: wristband.eventId,
      organizerId: wristband.organizerId,
      name: wristband.name,
      validFrom: wristband.validFrom || undefined,
      validUntil: wristband.validUntil || undefined,
      isReusable: wristband.isReusable,
      maxScans: wristband.maxScans || undefined,
    });

    // Generate barcode value
    const barcodeValue = generateBarcodeValue(barcodeData);

    // Generate barcode image (server-side)
    const barcodeBuffer = await generateBarcodeImageServer(barcodeValue, PRINT_BARCODE_OPTIONS);
    
    // Convert buffer to base64 data URL
    const barcodeImageUrl = `data:image/png;base64,${barcodeBuffer.toString('base64')}`;

    // Encrypt barcode data for storage
    const encryptedBarcodeData = encryptWristbandBarcodeData(barcodeData);

    // Update wristband with barcode information
    const updatedWristband = await prisma.wristbandQRCode.update({
      where: { id: params.wristbandId },
      data: {
        barcodeType: "CODE128",
        barcodeValue,
        barcodeImageUrl,
        barcodeData: encryptedBarcodeData,
        barcodeGeneratedAt: new Date(),
        codeType: "BARCODE",
        status: WristbandQRCodeStatus.ACTIVE,
      },
    });

    return {
      success: true,
      barcodeImageUrl: updatedWristband.barcodeImageUrl || undefined,
    };
  } catch (error) {
    console.error("Error generating wristband barcode:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate barcode",
    };
  }
}

/**
 * Validate wristband barcode
 */
export async function validateWristbandBarcode(
  barcodeValue: string,
  organizerId: string
): Promise<{
  success: boolean;
  wristband?: any;
  error?: string;
}> {
  try {
    // Parse barcode value to get wristband info
    const parsedBarcode = parseBarcodeValue(barcodeValue);
    
    if (!parsedBarcode) {
      return {
        success: false,
        error: "Invalid barcode format",
      };
    }

    // Find wristband by barcode value
    const wristband = await prisma.wristbandQRCode.findFirst({
      where: {
        barcodeValue,
        organizerId,
        codeType: "BARCODE",
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

    // Check if wristband is active
    if (wristband.status !== WristbandQRCodeStatus.ACTIVE) {
      return {
        success: false,
        error: "Wristband is not active",
      };
    }

    // Validate barcode data if available
    if (wristband.barcodeData) {
      try {
        const decryptedData = decryptWristbandBarcodeData(wristband.barcodeData);
        
        if (!validateWristbandBarcodeData(decryptedData)) {
          return {
            success: false,
            error: "Invalid or corrupted barcode data",
          };
        }
      } catch (error) {
        return {
          success: false,
          error: "Failed to validate barcode data",
        };
      }
    }

    // Check validity period
    const now = new Date();
    if (wristband.validFrom && now < wristband.validFrom) {
      return {
        success: false,
        error: "Wristband is not yet valid",
      };
    }

    if (wristband.validUntil && now > wristband.validUntil) {
      return {
        success: false,
        error: "Wristband has expired",
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
        eventTitle: wristband.event?.title,
        scanCount: wristband.scanCount,
        maxScans: wristband.maxScans,
        isReusable: wristband.isReusable,
        validFrom: wristband.validFrom,
        validUntil: wristband.validUntil,
        status: wristband.status,
        codeType: wristband.codeType,
      },
    };
  } catch (error) {
    console.error("Error validating wristband barcode:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to validate barcode",
    };
  }
}

/**
 * Scan wristband barcode (verify authenticity and log scan)
 */
export async function scanWristbandBarcode(
  barcodeValue: string,
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
    // First validate the barcode
    const validationResult = await validateWristbandBarcode(barcodeValue, organizerId);
    
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

    // Log successful scan
    const scanLog = await logWristbandScanAttempt({
      wristbandId: wristband.id,
      organizerId,
      scannedBy,
      scanResult: 'SUCCESS',
      scanLocation,
      scanDevice,
      notes: 'Barcode scan successful',
    });

    // Update scan count
    await prisma.wristbandQRCode.update({
      where: { id: wristband.id },
      data: {
        scanCount: {
          increment: 1,
        },
      },
    });

    return {
      success: true,
      wristband: {
        ...wristband,
        scanCount: wristband.scanCount + 1,
      },
      scanLog,
    };
  } catch (error) {
    console.error("Error scanning wristband barcode:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to scan barcode",
    };
  }
}

/**
 * Log wristband scan attempt
 */
async function logWristbandScanAttempt(params: {
  wristbandId: string | null;
  organizerId: string;
  scannedBy: string;
  scanResult: string;
  scanLocation?: string;
  scanDevice?: string;
  notes?: string;
}): Promise<any> {
  try {
    if (!params.wristbandId) {
      // Can't log without wristband ID in current schema
      return null;
    }

    const scanLog = await prisma.wristbandScanLog.create({
      data: {
        wristbandQRId: params.wristbandId,
        scannedBy: params.scannedBy,
        scanResult: params.scanResult,
        scanLocation: params.scanLocation,
        scanDevice: params.scanDevice,
        notes: params.notes,
      },
    });

    return scanLog;
  } catch (error) {
    console.error("Error logging wristband scan attempt:", error);
  }
}

/**
 * Create a new wristband with barcode
 */
export async function createWristbandWithBarcode(params: {
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

    // Generate unique barcode identifier
    const barcodeCode = generateUniqueCode();

    // Create wristband with barcode type
    const wristband = await prisma.wristbandQRCode.create({
      data: {
        eventId: params.eventId,
        organizerId: params.organizerId,
        name: params.name,
        description: params.description,
        qrCode: barcodeCode, // Use qrCode field for backward compatibility
        validFrom: params.validFrom,
        validUntil: params.validUntil,
        maxScans: params.maxScans,
        createdBy: params.createdBy,
        codeType: "BARCODE",
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
      wristband,
    };
  } catch (error) {
    console.error("Error creating wristband with barcode:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create wristband",
    };
  }
}
