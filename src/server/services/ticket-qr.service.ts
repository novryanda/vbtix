import { prisma } from "~/server/db";
import {
  generateQRCodeData,
  generateQRCodeImage,
  generateQRCodeBuffer,
  encryptQRCodeData,
  validateScannedQRCode,
  type TicketQRData,
  type QRCodeOptions,
} from "~/lib/services/qr-code.service";
import { QRCodeStatus, TicketStatus } from "@prisma/client";

/**
 * Audit logging interface for check-in activities
 */
interface CheckInAuditLog {
  attemptId: string;
  ticketId?: string;
  organizerId: string;
  eventId?: string;
  action: 'CHECK_IN_SUCCESS' | 'CHECK_IN_ERROR' | 'VALIDATION_FAILED';
  timestamp: Date;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Log check-in activity for audit purposes
 */
async function logCheckInActivity(log: CheckInAuditLog): Promise<void> {
  try {
    // For now, we'll use console logging with structured format
    // This can be extended to use a proper audit logging service
    console.log(`📋 AUDIT LOG: ${log.action}`, {
      attemptId: log.attemptId,
      ticketId: log.ticketId,
      organizerId: log.organizerId,
      eventId: log.eventId,
      timestamp: log.timestamp.toISOString(),
      error: log.error,
      metadata: log.metadata,
    });

    // TODO: Implement proper audit logging to database or external service
    // await prisma.auditLog.create({ data: log });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

/**
 * Generate QR code for a ticket after payment verification
 */
export async function generateTicketQRCode(ticketId: string): Promise<{
  success: boolean;
  qrCodeImageUrl?: string;
  error?: string;
}> {
  try {
    // Get ticket with related data
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
      },
    });

    if (!ticket) {
      return {
        success: false,
        error: "Ticket not found",
      };
    }

    // Check if ticket is eligible for QR code generation
    if (ticket.transaction.status !== "SUCCESS") {
      return {
        success: false,
        error: "Payment not verified yet",
      };
    }

    // Check if QR code already generated
    if (ticket.qrCodeStatus === QRCodeStatus.GENERATED || ticket.qrCodeStatus === QRCodeStatus.ACTIVE) {
      return {
        success: true,
        qrCodeImageUrl: ticket.qrCodeImageUrl || undefined,
      };
    }

    // Generate QR code data
    const qrData = generateQRCodeData({
      ticketId: ticket.id,
      eventId: ticket.transaction.eventId,
      userId: ticket.userId,
      transactionId: ticket.transactionId,
      ticketTypeId: ticket.ticketTypeId,
      eventDate: ticket.transaction.event.startDate,
    });

    // Generate QR code image
    const qrCodeImageUrl = await generateQRCodeImage(qrData, {
      width: 300,
      height: 300,
      errorCorrectionLevel: "M",
    });

    // Encrypt QR data for storage
    const encryptedQRData = encryptQRCodeData(qrData);

    // Update ticket with QR code information
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        qrCodeImageUrl,
        qrCodeData: encryptedQRData,
        qrCodeGeneratedAt: new Date(),
        qrCodeStatus: QRCodeStatus.ACTIVE,
      },
    });

    return {
      success: true,
      qrCodeImageUrl: updatedTicket.qrCodeImageUrl || undefined,
    };
  } catch (error) {
    console.error("Error generating ticket QR code:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate QR code",
    };
  }
}

/**
 * Generate QR codes for all tickets in a transaction
 */
export async function generateTransactionQRCodes(transactionId: string): Promise<{
  success: boolean;
  generatedCount: number;
  errors: string[];
}> {
  try {
    // Get all tickets for the transaction
    const tickets = await prisma.ticket.findMany({
      where: { transactionId },
      include: {
        transaction: {
          include: {
            event: true,
          },
        },
      },
    });

    if (tickets.length === 0) {
      return {
        success: false,
        generatedCount: 0,
        errors: ["No tickets found for transaction"],
      };
    }

    // Check transaction status
    const transaction = tickets[0]?.transaction;
    if (!transaction || transaction.status !== "SUCCESS") {
      return {
        success: false,
        generatedCount: 0,
        errors: ["Transaction payment not verified"],
      };
    }

    const errors: string[] = [];
    let generatedCount = 0;

    // Generate QR codes for each ticket
    for (const ticket of tickets) {
      try {
        const result = await generateTicketQRCode(ticket.id);
        if (result.success) {
          generatedCount++;
        } else {
          errors.push(`Ticket ${ticket.id}: ${result.error}`);
        }
      } catch (error) {
        errors.push(`Ticket ${ticket.id}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    return {
      success: generatedCount > 0,
      generatedCount,
      errors,
    };
  } catch (error) {
    console.error("Error generating transaction QR codes:", error);
    return {
      success: false,
      generatedCount: 0,
      errors: [error instanceof Error ? error.message : "Failed to generate QR codes"],
    };
  }
}

/**
 * Validate a scanned QR code with enhanced error handling and logging
 */
export async function validateTicketQRCode(encryptedData: string, organizerId?: string): Promise<{
  isValid: boolean;
  ticket?: any;
  error?: string;
  errorCode?: string;
}> {
  const startTime = Date.now();

  try {
    // Log validation attempt
    console.log(`🔍 QR code validation started by organizer: ${organizerId || 'unknown'}`);

    // Basic input validation
    if (!encryptedData || typeof encryptedData !== 'string') {
      console.warn(`❌ Invalid QR code input: ${typeof encryptedData}`);
      return {
        isValid: false,
        error: "Invalid QR code format",
        errorCode: "INVALID_INPUT",
      };
    }

    // Validate and decrypt QR code data
    const validation = validateScannedQRCode(encryptedData);

    if (!validation.isValid || !validation.data) {
      console.warn(`❌ QR code decryption failed: ${validation.error}`);
      return {
        isValid: false,
        error: validation.error || "Invalid QR code format",
        errorCode: "DECRYPTION_FAILED",
      };
    }

    const qrData = validation.data;
    console.log(`🎫 QR code decrypted successfully for ticket: ${qrData.ticketId}`);

    // Get ticket from database with comprehensive includes
    const ticket = await prisma.ticket.findUnique({
      where: { id: qrData.ticketId },
      include: {
        transaction: {
          include: {
            event: {
              include: {
                organizer: {
                  select: {
                    id: true,
                    userId: true,
                  },
                },
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
      console.warn(`❌ Ticket not found in database: ${qrData.ticketId}`);
      return {
        isValid: false,
        error: "Ticket not found in system",
        errorCode: "TICKET_NOT_FOUND",
      };
    }

    // Verify QR data matches ticket (enhanced validation)
    const dataMatches = {
      eventId: ticket.transaction.eventId === qrData.eventId,
      userId: ticket.userId === qrData.userId,
      transactionId: ticket.transactionId === qrData.transactionId,
      ticketTypeId: ticket.ticketTypeId === qrData.ticketTypeId,
    };

    if (!dataMatches.eventId || !dataMatches.userId || !dataMatches.transactionId || !dataMatches.ticketTypeId) {
      console.warn(`❌ QR code data mismatch for ticket ${qrData.ticketId}:`, dataMatches);
      return {
        isValid: false,
        error: "QR code does not match ticket data",
        errorCode: "DATA_MISMATCH",
      };
    }

    // Check if organizer has permission to validate this ticket
    if (organizerId && ticket.transaction.event.organizer?.id !== organizerId) {
      console.warn(`❌ Organizer ${organizerId} attempted to validate ticket for different event`);
      return {
        isValid: false,
        error: "You don't have permission to validate this ticket",
        errorCode: "PERMISSION_DENIED",
      };
    }

    // Check payment status
    if (ticket.transaction.status !== "SUCCESS") {
      console.warn(`❌ Ticket ${qrData.ticketId} payment not verified: ${ticket.transaction.status}`);
      return {
        isValid: false,
        error: "Payment not verified for this ticket",
        errorCode: "PAYMENT_NOT_VERIFIED",
      };
    }

    // Check ticket status
    if (ticket.status !== TicketStatus.ACTIVE) {
      console.warn(`❌ Ticket ${qrData.ticketId} is not active: ${ticket.status}`);
      return {
        isValid: false,
        error: `Ticket is ${ticket.status.toLowerCase()}`,
        errorCode: "TICKET_INACTIVE",
      };
    }

    // Check QR code status
    if (ticket.qrCodeStatus === QRCodeStatus.EXPIRED) {
      console.warn(`❌ QR code expired for ticket ${qrData.ticketId}`);
      return {
        isValid: false,
        error: "QR code has expired",
        errorCode: "QR_EXPIRED",
      };
    }

    if (ticket.qrCodeStatus === QRCodeStatus.USED) {
      console.warn(`❌ QR code already used for ticket ${qrData.ticketId}`);
      return {
        isValid: false,
        error: "QR code has already been used",
        errorCode: "QR_ALREADY_USED",
      };
    }

    // Check if already checked in
    if (ticket.checkedIn) {
      const checkInTime = ticket.checkInTime ? new Date(ticket.checkInTime).toLocaleString() : "Unknown time";
      console.warn(`❌ Ticket ${qrData.ticketId} already checked in at ${checkInTime}`);
      return {
        isValid: false,
        error: `Ticket already checked in at ${checkInTime}`,
        errorCode: "ALREADY_CHECKED_IN",
      };
    }

    // Check if event date is valid (not too far in the past)
    const eventDate = new Date(ticket.transaction.event.startDate);
    const now = new Date();
    const daysDifference = (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDifference > 7) { // Event was more than 7 days ago
      console.warn(`❌ Event too old for check-in: ${daysDifference} days ago`);
      return {
        isValid: false,
        error: "Event date has passed the check-in window",
        errorCode: "EVENT_EXPIRED",
      };
    }

    const validationTime = Date.now() - startTime;
    console.log(`✅ QR code validation successful for ticket ${qrData.ticketId} (${validationTime}ms)`);

    return {
      isValid: true,
      ticket,
    };
  } catch (error) {
    const validationTime = Date.now() - startTime;
    console.error(`💥 Error validating ticket QR code (${validationTime}ms):`, error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Validation failed",
      errorCode: "SYSTEM_ERROR",
    };
  }
}

/**
 * Check in a ticket using QR code with enhanced logging and audit trail
 */
export async function checkInTicketWithQR(
  encryptedData: string,
  organizerId: string
): Promise<{
  success: boolean;
  ticket?: any;
  error?: string;
  errorCode?: string;
}> {
  const startTime = Date.now();
  const checkInAttemptId = `checkin_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

  try {
    console.log(`🎫 Check-in attempt started: ${checkInAttemptId} by organizer ${organizerId}`);

    // First validate the QR code with organizer context
    const validation = await validateTicketQRCode(encryptedData, organizerId);

    if (!validation.isValid || !validation.ticket) {
      console.warn(`❌ Check-in validation failed: ${checkInAttemptId} - ${validation.error}`);
      return {
        success: false,
        error: validation.error,
        errorCode: validation.errorCode,
      };
    }

    const ticket = validation.ticket;
    console.log(`🎫 Ticket validated for check-in: ${ticket.id} (${ticket.transaction.event.title})`);

    // Verify organizer has permission to check in this ticket
    if (ticket.transaction.event.organizer?.id !== organizerId) {
      console.warn(`❌ Permission denied for check-in: ${checkInAttemptId} - organizer ${organizerId} vs event organizer ${ticket.transaction.event.organizer?.id}`);
      return {
        success: false,
        error: "You don't have permission to check in this ticket",
        errorCode: "PERMISSION_DENIED",
      };
    }

    // Additional check for already checked in (double-check for race conditions)
    if (ticket.checkedIn) {
      const checkInTime = ticket.checkInTime ? new Date(ticket.checkInTime).toLocaleString() : "Unknown time";
      console.warn(`❌ Ticket already checked in: ${checkInAttemptId} - ${ticket.id} at ${checkInTime}`);
      return {
        success: false,
        error: `Ticket was already checked in at ${checkInTime}`,
        errorCode: "ALREADY_CHECKED_IN",
      };
    }

    // Perform the check-in with atomic update
    const checkInTime = new Date();
    const updatedTicket = await prisma.ticket.update({
      where: {
        id: ticket.id,
        checkedIn: false, // Additional safety check to prevent race conditions
      },
      data: {
        checkedIn: true,
        checkInTime: checkInTime,
        scannedAt: checkInTime,
        qrCodeStatus: QRCodeStatus.USED,
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

    const processingTime = Date.now() - startTime;

    // Log successful check-in with audit information
    console.log(`✅ Check-in successful: ${checkInAttemptId}`, {
      ticketId: updatedTicket.id,
      eventTitle: updatedTicket.transaction.event.title,
      attendeeName: updatedTicket.ticketHolder?.fullName || updatedTicket.user.name,
      organizerId: organizerId,
      checkInTime: checkInTime.toISOString(),
      processingTimeMs: processingTime,
    });

    // Create audit log entry (if audit logging is implemented)
    try {
      await logCheckInActivity({
        attemptId: checkInAttemptId,
        ticketId: updatedTicket.id,
        organizerId: organizerId,
        eventId: updatedTicket.transaction.eventId,
        action: 'CHECK_IN_SUCCESS',
        timestamp: checkInTime,
        metadata: {
          attendeeName: updatedTicket.ticketHolder?.fullName || updatedTicket.user.name,
          ticketType: updatedTicket.ticketType.name,
          processingTimeMs: processingTime,
        },
      });
    } catch (auditError) {
      console.warn(`⚠️ Failed to log check-in activity: ${auditError}`);
      // Don't fail the check-in if audit logging fails
    }

    return {
      success: true,
      ticket: updatedTicket,
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`💥 Check-in error: ${checkInAttemptId} (${processingTime}ms):`, error);

    // Log failed check-in attempt
    try {
      await logCheckInActivity({
        attemptId: checkInAttemptId,
        organizerId: organizerId,
        action: 'CHECK_IN_ERROR',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          processingTimeMs: processingTime,
        },
      });
    } catch (auditError) {
      console.warn(`⚠️ Failed to log check-in error: ${auditError}`);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Check-in failed",
      errorCode: "SYSTEM_ERROR",
    };
  }
}

/**
 * Get QR code image for a ticket
 */
export async function getTicketQRCode(ticketId: string, userId?: string): Promise<{
  success: boolean;
  qrCodeImageUrl?: string;
  error?: string;
}> {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        transaction: {
          include: {
            event: {
              include: {
                organizer: {
                  select: {
                    id: true,
                    userId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      return {
        success: false,
        error: "Ticket not found",
      };
    }

    // Check access permissions if userId provided
    if (userId) {
      const isTicketOwner = ticket.userId === userId;
      const isEventOrganizer = ticket.transaction.event.organizer?.userId === userId;

      // Allow access if user is either the ticket owner or the event organizer
      if (!isTicketOwner && !isEventOrganizer) {
        console.log("QR code access denied:", {
          ticketId,
          requestingUserId: userId,
          ticketOwnerId: ticket.userId,
          eventOrganizerId: ticket.transaction.event.organizer?.userId,
          isTicketOwner,
          isEventOrganizer,
        });

        return {
          success: false,
          error: "Access denied",
        };
      }
    }

    // Check if QR code exists
    if (!ticket.qrCodeImageUrl || ticket.qrCodeStatus === QRCodeStatus.PENDING) {
      // If payment is verified but QR code not generated, try to generate it
      if (ticket.transaction.status === "SUCCESS") {
        console.log(`🎫 Payment verified but QR code missing for ticket ${ticketId}, attempting generation...`);
        const generateResult = await generateTicketQRCode(ticketId);

        if (generateResult.success && generateResult.qrCodeImageUrl) {
          return {
            success: true,
            qrCodeImageUrl: generateResult.qrCodeImageUrl,
          };
        } else {
          console.warn(`⚠️ Failed to generate QR code for ticket ${ticketId}:`, generateResult.error);
        }
      }

      return {
        success: false,
        error: "QR code not generated yet",
      };
    }

    return {
      success: true,
      qrCodeImageUrl: ticket.qrCodeImageUrl,
    };
  } catch (error) {
    console.error("Error getting ticket QR code:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get QR code",
    };
  }
}
