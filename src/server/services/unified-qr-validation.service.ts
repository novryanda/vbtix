import { 
  decryptQRCodeData, 
  decryptWristbandQRCodeData,
  validateQRCodeData,
  validateWristbandQRCodeData,
  type TicketQRData,
  type WristbandQRData 
} from "~/lib/services/qr-code.service";
import { validateTicketQRCode, checkInTicketWithQR } from "~/server/services/ticket-qr.service";
import { validateWristbandQRCode, scanWristbandQRCode } from "~/server/services/wristband-qr.service";

/**
 * QR Code types that can be detected
 */
export enum QRCodeType {
  TICKET = "TICKET",
  WRISTBAND = "WRISTBAND",
  UNKNOWN = "UNKNOWN"
}

/**
 * Unified QR code validation result
 */
export interface UnifiedQRValidationResult {
  success: boolean;
  type: QRCodeType;
  data?: {
    ticket?: any;
    wristband?: any;
    scanLog?: any;
    message?: string;
  };
  error?: string;
}

/**
 * Detect QR code type by attempting to decrypt with different methods
 */
export async function detectQRCodeType(qrCodeData: string): Promise<QRCodeType> {
  try {
    // Try to decrypt as ticket first
    const ticketData = decryptQRCodeData(qrCodeData);
    if (ticketData && validateQRCodeData(ticketData)) {
      return QRCodeType.TICKET;
    }
  } catch (error) {
    // Not a ticket, continue
  }

  try {
    // Try to decrypt as wristband
    const wristbandData = decryptWristbandQRCodeData(qrCodeData);
    if (wristbandData && validateWristbandQRCodeData(wristbandData)) {
      return QRCodeType.WRISTBAND;
    }
  } catch (error) {
    // Not a wristband either
  }

  return QRCodeType.UNKNOWN;
}

/**
 * Unified QR code validation that handles both tickets and wristbands
 */
export async function validateUnifiedQRCode(
  qrCodeData: string,
  organizerId: string
): Promise<UnifiedQRValidationResult> {
  try {
    // First detect the QR code type
    const qrType = await detectQRCodeType(qrCodeData);

    switch (qrType) {
      case QRCodeType.TICKET:
        return await validateTicketQRCodeUnified(qrCodeData, organizerId);
      
      case QRCodeType.WRISTBAND:
        return await validateWristbandQRCodeUnified(qrCodeData, organizerId);
      
      default:
        return {
          success: false,
          type: QRCodeType.UNKNOWN,
          error: "Invalid or unrecognized QR code format",
        };
    }
  } catch (error) {
    console.error("Error in unified QR validation:", error);
    return {
      success: false,
      type: QRCodeType.UNKNOWN,
      error: error instanceof Error ? error.message : "Validation failed",
    };
  }
}

/**
 * Unified QR code scanning that handles both tickets and wristbands
 */
export async function scanUnifiedQRCode(
  qrCodeData: string,
  organizerId: string,
  scannedBy: string,
  options?: {
    checkIn?: boolean; // For tickets
    scanLocation?: string;
    scanDevice?: string;
  }
): Promise<UnifiedQRValidationResult> {
  try {
    // First detect the QR code type
    const qrType = await detectQRCodeType(qrCodeData);

    switch (qrType) {
      case QRCodeType.TICKET:
        return await scanTicketQRCodeUnified(qrCodeData, organizerId, scannedBy, options);
      
      case QRCodeType.WRISTBAND:
        return await scanWristbandQRCodeUnified(qrCodeData, organizerId, scannedBy, options);
      
      default:
        return {
          success: false,
          type: QRCodeType.UNKNOWN,
          error: "Invalid or unrecognized QR code format",
        };
    }
  } catch (error) {
    console.error("Error in unified QR scanning:", error);
    return {
      success: false,
      type: QRCodeType.UNKNOWN,
      error: error instanceof Error ? error.message : "Scan failed",
    };
  }
}

/**
 * Validate ticket QR code and return unified result
 */
async function validateTicketQRCodeUnified(
  qrCodeData: string,
  organizerId: string
): Promise<UnifiedQRValidationResult> {
  try {
    const result = await validateTicketQRCode(qrCodeData, organizerId);
    
    return {
      success: result.success,
      type: QRCodeType.TICKET,
      data: result.success ? {
        ticket: result.ticket,
        message: "Ticket is valid",
      } : undefined,
      error: result.error,
    };
  } catch (error) {
    return {
      success: false,
      type: QRCodeType.TICKET,
      error: error instanceof Error ? error.message : "Ticket validation failed",
    };
  }
}

/**
 * Validate wristband QR code and return unified result
 */
async function validateWristbandQRCodeUnified(
  qrCodeData: string,
  organizerId: string
): Promise<UnifiedQRValidationResult> {
  try {
    const result = await validateWristbandQRCode(qrCodeData, organizerId);
    
    return {
      success: result.success,
      type: QRCodeType.WRISTBAND,
      data: result.success ? {
        wristband: result.wristband,
        message: "Wristband is valid",
      } : undefined,
      error: result.error,
    };
  } catch (error) {
    return {
      success: false,
      type: QRCodeType.WRISTBAND,
      error: error instanceof Error ? error.message : "Wristband validation failed",
    };
  }
}

/**
 * Scan ticket QR code and return unified result
 */
async function scanTicketQRCodeUnified(
  qrCodeData: string,
  organizerId: string,
  scannedBy: string,
  options?: {
    checkIn?: boolean;
    scanLocation?: string;
    scanDevice?: string;
  }
): Promise<UnifiedQRValidationResult> {
  try {
    if (options?.checkIn) {
      // Perform check-in
      const result = await checkInTicketWithQR(qrCodeData, organizerId);
      
      return {
        success: result.success,
        type: QRCodeType.TICKET,
        data: result.success ? {
          ticket: result.ticket,
          message: "Ticket checked in successfully",
        } : undefined,
        error: result.error,
      };
    } else {
      // Just validate
      return await validateTicketQRCodeUnified(qrCodeData, organizerId);
    }
  } catch (error) {
    return {
      success: false,
      type: QRCodeType.TICKET,
      error: error instanceof Error ? error.message : "Ticket scan failed",
    };
  }
}

/**
 * Scan wristband QR code and return unified result
 */
async function scanWristbandQRCodeUnified(
  qrCodeData: string,
  organizerId: string,
  scannedBy: string,
  options?: {
    scanLocation?: string;
    scanDevice?: string;
  }
): Promise<UnifiedQRValidationResult> {
  try {
    // Wristbands are always scanned (logged), not just validated
    const result = await scanWristbandQRCode(
      qrCodeData,
      organizerId,
      scannedBy,
      options?.scanLocation,
      options?.scanDevice
    );
    
    return {
      success: result.success,
      type: QRCodeType.WRISTBAND,
      data: result.success ? {
        wristband: result.wristband,
        scanLog: result.scanLog,
        message: "Wristband scanned successfully",
      } : undefined,
      error: result.error,
    };
  } catch (error) {
    return {
      success: false,
      type: QRCodeType.WRISTBAND,
      error: error instanceof Error ? error.message : "Wristband scan failed",
    };
  }
}

/**
 * Get QR code type information for display purposes
 */
export function getQRCodeTypeInfo(type: QRCodeType) {
  switch (type) {
    case QRCodeType.TICKET:
      return {
        name: "Ticket",
        description: "Event ticket for check-in",
        icon: "🎫",
        color: "blue",
        action: "Check In",
      };
    
    case QRCodeType.WRISTBAND:
      return {
        name: "Wristband",
        description: "Reusable wristband for verification",
        icon: "🔒",
        color: "green",
        action: "Verify",
      };
    
    default:
      return {
        name: "Unknown",
        description: "Unrecognized QR code",
        icon: "❓",
        color: "gray",
        action: "Scan",
      };
  }
}
