import { prisma } from "~/server/db";
import { PaymentStatus } from "@prisma/client";
import { env } from "~/env";
import { generateTransactionQRCodes } from "~/server/services/ticket-qr.service";
import { emailService } from "~/lib/email-service";

// Import both Xendit and Mock payment services
import {
  createPayment,
  XenditPaymentMethod,
  VirtualAccountBank,
  EWalletType,
  QRCodeType,
  RetailOutletType,
  mapXenditStatusToInternal,
  type CreatePaymentParams,
} from "~/lib/xendit";

import {
  createMockPayment,
  MockPaymentMethod,
  mapMockStatusToInternal,
  type MockPaymentParams,
} from "~/lib/mock-payment";

import { paymentMethodService } from "~/server/services/payment-method.service";

/**
 * Initiate checkout process with Xendit (supports guest purchases)
 */
export async function handleInitiateCheckout(params: {
  orderId: string;
  userId?: string | null;
  sessionId?: string;
  paymentMethod: string;
  paymentMethodDetails?: any;
}) {
  const { orderId, userId, sessionId, paymentMethod, paymentMethodDetails } =
    params;

  // Build where clause for order lookup
  let whereClause: any = {
    id: orderId,
  };

  if (userId) {
    // For authenticated users
    whereClause.userId = userId;
  } else if (sessionId) {
    // For guest users, find orders created by guest users with matching session ID
    whereClause.user = {
      phone: `guest_${sessionId}`, // Guest users have phone set to guest_sessionId
    };
  } else {
    throw new Error("Either userId or sessionId must be provided");
  }

  // Get order with user and event details
  const order = await prisma.transaction.findFirst({
    where: whereClause,
    include: {
      orderItems: true,
      user: true,
      event: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Check if order can be checked out
  if (order.status !== "PENDING") {
    throw new Error("Only pending orders can be checked out");
  }

  // Validate payment method is allowed for all ticket types in the order
  for (const orderItem of order.orderItems) {
    const isAllowed = await paymentMethodService.isPaymentMethodAllowedForTicketType(
      orderItem.ticketTypeId,
      paymentMethod
    );

    if (!isAllowed) {
      // Get ticket type name for better error message
      const ticketType = await prisma.ticketType.findUnique({
        where: { id: orderItem.ticketTypeId },
        select: { name: true },
      });

      throw new Error(
        `Payment method "${paymentMethod}" is not allowed for ticket type "${ticketType?.name || 'Unknown'}"`
      );
    }
  }

  // Handle manual payment
  if (paymentMethod === "MANUAL_PAYMENT") {
    // Update order status to PENDING for manual approval and create tickets in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update order with payment method
      const updatedOrder = await tx.transaction.update({
        where: { id: orderId },
        data: {
          paymentMethod: "MANUAL_PAYMENT",
          status: "PENDING",
          details: {
            type: "manual_payment",
            awaitingVerification: true,
            submittedAt: new Date().toISOString(),
          },
        },
        include: {
          orderItems: true,
          tickets: true,
        },
      });

      // Create tickets if they don't exist yet (after payment method selection)
      if (updatedOrder.tickets.length === 0) {
        const ticketData = [];
        const ticketHolderData = [];

        // Get stored ticket holder data from transaction details
        const storedTicketHolders = (updatedOrder.details as any)?.ticketHolders || [];

        for (const item of updatedOrder.orderItems) {
          for (let i = 0; i < item.quantity; i++) {
            const qrCode = `${orderId}-${item.ticketTypeId}-${i + 1}`;
            const ticketId = `ticket_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 11)}`;

            ticketData.push({
              id: ticketId,
              ticketTypeId: item.ticketTypeId,
              transactionId: orderId,
              userId: updatedOrder.userId,
              qrCode,
              status: "PENDING", // PENDING until admin approval
            });

            // Add ticket holder data if exists
            const holder = storedTicketHolders.find((h: any) => h.ticketIndex === i);
            if (holder) {
              ticketHolderData.push({
                ticketId,
                fullName: holder.fullName,
                identityType: holder.identityType,
                identityNumber: holder.identityNumber,
                email: holder.email,
                whatsapp: holder.whatsapp,
              });
            }
          }
        }

        if (ticketData.length > 0) {
          await tx.ticket.createMany({
            data: ticketData,
          });

          // Create ticket holders if any
          if (ticketHolderData.length > 0) {
            await tx.ticketHolder.createMany({
              data: ticketHolderData,
            });
          }
        }
      }

      // Create payment record for manual payment
      const payment = await tx.payment.create({
        data: {
          orderId,
          gateway: "MANUAL",
          amount: order.amount,
          status: "PENDING",
          paymentId: `MANUAL_${orderId}_${Date.now()}`,
          callbackPayload: {
            type: "manual_payment",
            orderId: orderId,
            createdAt: new Date().toISOString(),
          },
        },
      });

      return { updatedOrder, payment };
    });

    return {
      order: result.updatedOrder,
      payment: result.payment,
      checkoutUrl: undefined,
      paymentToken: result.payment.paymentId,
      paymentInstructions: {
        type: "manual_payment",
        message:
          "Pesanan Anda sedang menunggu konfirmasi pembayaran dari admin. Anda akan menerima email konfirmasi setelah pembayaran disetujui.",
      },
      isTestMode: false,
      gateway: "MANUAL",
    };
  }

  // Handle QRIS By Wonders payment (same as manual but with QRIS identifier)
  if (paymentMethod === "QRIS_BY_WONDERS") {
    // Update order status to PENDING for manual approval and create tickets in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update order with payment method
      const updatedOrder = await tx.transaction.update({
        where: { id: orderId },
        data: {
          paymentMethod: "QRIS_BY_WONDERS",
          status: "PENDING",
          details: {
            type: "qris_by_wonders",
            awaitingVerification: true,
            submittedAt: new Date().toISOString(),
          },
        },
        include: {
          orderItems: true,
          tickets: true,
        },
      });

      // Create tickets if they don't exist yet (after payment method selection)
      if (updatedOrder.tickets.length === 0) {
        const ticketData = [];
        const ticketHolderData = [];

        // Get stored ticket holder data from transaction details
        const storedTicketHolders = (updatedOrder.details as any)?.ticketHolders || [];

        for (const item of updatedOrder.orderItems) {
          for (let i = 0; i < item.quantity; i++) {
            const qrCode = `${orderId}-${item.ticketTypeId}-${i + 1}`;
            const ticketId = `ticket_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 11)}`;

            ticketData.push({
              id: ticketId,
              ticketTypeId: item.ticketTypeId,
              transactionId: orderId,
              userId: updatedOrder.userId,
              qrCode,
              status: "PENDING", // PENDING until admin approval
            });

            // Add ticket holder data if exists
            const holder = storedTicketHolders.find((h: any) => h.ticketIndex === i);
            if (holder) {
              ticketHolderData.push({
                ticketId,
                fullName: holder.fullName,
                identityType: holder.identityType,
                identityNumber: holder.identityNumber,
                email: holder.email,
                whatsapp: holder.whatsapp,
              });
            }
          }
        }

        if (ticketData.length > 0) {
          await tx.ticket.createMany({
            data: ticketData,
          });

          // Create ticket holders if any
          if (ticketHolderData.length > 0) {
            await tx.ticketHolder.createMany({
              data: ticketHolderData,
            });
          }
        }
      }

      // Create payment record for QRIS By Wonders payment
      const payment = await tx.payment.create({
        data: {
          orderId,
          gateway: "QRIS_WONDERS",
          amount: order.amount,
          status: "PENDING",
          paymentId: `QRIS_WONDERS_${orderId}_${Date.now()}`,
          callbackPayload: {
            type: "qris_by_wonders",
            orderId: orderId,
            createdAt: new Date().toISOString(),
          },
        },
      });

      return { updatedOrder, payment };
    });

    return {
      order: result.updatedOrder,
      payment: result.payment,
      checkoutUrl: undefined,
      paymentToken: result.payment.paymentId,
      paymentInstructions: {
        type: "qris_by_wonders",
        message:
          "Silakan scan QR code yang telah ditampilkan untuk melakukan pembayaran. Pesanan Anda akan dikonfirmasi secara manual oleh admin setelah pembayaran berhasil.",
      },
      isTestMode: false,
      gateway: "QRIS_WONDERS",
    };
  }

  // Check if Xendit is enabled (has secret key)
  const isXenditEnabled = !!env.XENDIT_SECRET_KEY;

  try {
    let paymentResponse: any;
    let gateway: string;

    if (isXenditEnabled) {
      // Use Xendit for real payments
      const xenditPaymentMethod = parsePaymentMethod(paymentMethod);
      const xenditPaymentDetails = parsePaymentMethodDetails(
        paymentMethod,
        paymentMethodDetails,
      );

      paymentResponse = await createPayment({
        orderId: order.id,
        amount: Number(order.amount),
        currency: order.currency,
        paymentMethod: xenditPaymentMethod,
        paymentMethodDetails: xenditPaymentDetails,
        customer: {
          referenceId: order.userId,
          email: order.user.email!,
          mobileNumber: order.user.phone || undefined,
          givenNames: order.user.name || undefined,
        },
        description: `Payment for ${order.event.title} - Order ${order.invoiceNumber}`,
        metadata: {
          orderId: order.id,
          eventId: order.eventId,
          userId: order.userId,
          invoiceNumber: order.invoiceNumber,
        },
      });
      gateway = "XENDIT";
    } else {
      // Use Mock Payment for testing
      const mockPaymentMethod = mapPaymentMethodToMock(paymentMethod);

      paymentResponse = await createMockPayment({
        orderId: order.id,
        amount: Number(order.amount),
        currency: order.currency,
        paymentMethod: mockPaymentMethod,
        paymentMethodDetails,
        customer: {
          referenceId: order.userId,
          email: order.user.email!,
          mobileNumber: order.user.phone || undefined,
          givenNames: order.user.name || undefined,
        },
        description: `Test Payment for ${order.event.title} - Order ${order.invoiceNumber}`,
        metadata: {
          orderId: order.id,
          eventId: order.eventId,
          userId: order.userId,
          invoiceNumber: order.invoiceNumber,
        },
      });
      gateway = "MOCK";
    }

    // Update order with payment method and create tickets in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update order with payment method
      const updatedOrder = await tx.transaction.update({
        where: { id: orderId },
        data: {
          paymentMethod,
        },
        include: {
          orderItems: true,
          tickets: true,
        },
      });

      // Create tickets if they don't exist yet (after payment method selection)
      if (updatedOrder.tickets.length === 0) {
        const ticketData = [];
        const ticketHolderData = [];

        // Get stored ticket holder data from transaction details
        const storedTicketHolders = (updatedOrder.details as any)?.ticketHolders || [];

        for (const item of updatedOrder.orderItems) {
          for (let i = 0; i < item.quantity; i++) {
            const qrCode = `${orderId}-${item.ticketTypeId}-${i + 1}`;
            const ticketId = `ticket_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 11)}`;

            ticketData.push({
              id: ticketId,
              ticketTypeId: item.ticketTypeId,
              transactionId: orderId,
              userId: updatedOrder.userId,
              qrCode,
              status: "PENDING", // PENDING until admin approval
            });

            // Add ticket holder data if exists
            const holder = storedTicketHolders.find((h: any) => h.ticketIndex === i);
            if (holder) {
              ticketHolderData.push({
                ticketId,
                fullName: holder.fullName,
                identityType: holder.identityType,
                identityNumber: holder.identityNumber,
                email: holder.email,
                whatsapp: holder.whatsapp,
              });
            }
          }
        }

        if (ticketData.length > 0) {
          await tx.ticket.createMany({
            data: ticketData,
          });

          // Create ticket holders if any
          if (ticketHolderData.length > 0) {
            await tx.ticketHolder.createMany({
              data: ticketHolderData,
            });
          }
        }
      }

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          orderId,
          gateway,
          amount: order.amount,
          status: "PENDING",
          paymentId: paymentResponse.id,
          callbackPayload: paymentResponse as any,
        },
      });

      return { updatedOrder, payment };
    });

    // Extract checkout URL or payment instructions
    const checkoutUrl = isXenditEnabled
      ? extractCheckoutUrl(paymentResponse)
      : undefined;

    return {
      order: result.updatedOrder,
      payment: result.payment,
      checkoutUrl,
      paymentToken: paymentResponse.id,
      paymentInstructions: paymentResponse.paymentInstructions,
      isTestMode: !isXenditEnabled,
      gateway,
    };
  } catch (error) {
    console.error(
      `Error creating ${isXenditEnabled ? "Xendit" : "Mock"} payment:`,
      error,
    );
    throw new Error(
      `Failed to create payment: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Process payment callback (from Xendit or Mock Payment)
 */
export async function handlePaymentCallback(params: {
  orderId?: string;
  paymentId: string;
  status: PaymentStatus;
  paymentReference?: string;
  callbackPayload?: any;
  xenditStatus?: string;
  mockStatus?: string;
}) {
  const {
    orderId,
    paymentId,
    status,
    paymentReference,
    callbackPayload,
    xenditStatus,
    mockStatus,
  } = params;

  // Map external status to internal status
  let finalStatus: PaymentStatus;
  if (xenditStatus) {
    finalStatus = mapXenditStatusToInternal(xenditStatus);
  } else if (mockStatus) {
    finalStatus = mapMockStatusToInternal(mockStatus);
  } else {
    finalStatus = status;
  }

  // Find payment first, then get order from payment if orderId not provided
  let payment = await prisma.payment.findFirst({
    where: paymentId ? { paymentId } : { id: paymentId },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  const actualOrderId = orderId || payment.orderId;

  // Get order
  const order = await prisma.transaction.findUnique({
    where: { id: actualOrderId },
    include: {
      tickets: true,
      orderItems: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Update payment status
  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: finalStatus,
      paymentId: paymentReference,
      callbackPayload,
      receivedAt: new Date(),
    },
  });

  // Update order status based on payment status
  let updatedOrder;
  if (finalStatus === "SUCCESS") {
    // Process successful payment
    updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order
      const updated = await tx.transaction.update({
        where: { id: actualOrderId },
        data: {
          status: "SUCCESS",
          paymentReference,
        },
      });

      // Update ticket statuses if needed
      if (order.status !== "SUCCESS") {
        await tx.ticket.updateMany({
          where: { transactionId: actualOrderId },
          data: {
            status: "ACTIVE",
          },
        });

        // Generate QR codes for all tickets in the transaction
        try {
          const qrResult = await generateTransactionQRCodes(actualOrderId);
          console.log(`QR code generation result: ${qrResult.generatedCount} generated, errors:`, qrResult.errors);

          // Send email with PDF tickets after QR codes are generated
          if (qrResult.success && qrResult.generatedCount > 0) {
            try {
              await sendTicketDeliveryEmailWithPDF(actualOrderId);
              console.log(`✅ Ticket delivery email with PDF sent for order ${actualOrderId}`);
            } catch (emailError) {
              console.error("Error sending ticket delivery email with PDF:", emailError);
              // Fallback to regular email if PDF generation fails
              try {
                await sendTicketDeliveryEmail(actualOrderId);
                console.log(`✅ Fallback: Regular ticket delivery email sent for order ${actualOrderId}`);
              } catch (fallbackError) {
                console.error("Error sending fallback ticket delivery email:", fallbackError);
                // Don't fail the payment process if email sending fails
              }
            }
          }
        } catch (qrError) {
          console.error("Error generating QR codes:", qrError);
          // Don't fail the payment process if QR generation fails
        }
      }

      return updated;
    });
  } else if (finalStatus === "FAILED") {
    // Process failed payment
    updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order
      const updated = await tx.transaction.update({
        where: { id: actualOrderId },
        data: {
          status: "FAILED",
        },
      });

      // Restore ticket type quantities if needed
      if (order.status === "PENDING") {
        for (const item of order.orderItems) {
          await tx.ticketType.update({
            where: { id: item.ticketTypeId },
            data: {
              // Do NOT decrement sold count for PENDING tickets since they were never counted as sold
              // Only restore reserved inventory
              reserved: {
                decrement: item.quantity,
              },
            },
          });
        }

        // Update ticket statuses
        await tx.ticket.updateMany({
          where: { transactionId: actualOrderId },
          data: {
            status: "CANCELLED",
          },
        });
      }

      return updated;
    });
  } else {
    // For other statuses, just update the order status
    updatedOrder = await prisma.transaction.update({
      where: { id: actualOrderId },
      data: {
        status: finalStatus,
      },
    });
  }

  return {
    order: updatedOrder,
    payment: updatedPayment,
  };
}

/**
 * Parse payment method string to Xendit payment method enum
 */
function parsePaymentMethod(paymentMethod: string): XenditPaymentMethod {
  switch (paymentMethod.toUpperCase()) {
    case "VIRTUAL_ACCOUNT":
    case "VA":
      return XenditPaymentMethod.VIRTUAL_ACCOUNT;
    case "EWALLET":
    case "E_WALLET":
      return XenditPaymentMethod.EWALLET;
    case "QR_CODE":
    case "QRIS":
      return XenditPaymentMethod.QR_CODE;
    case "RETAIL_OUTLET":
    case "OVER_THE_COUNTER":
      return XenditPaymentMethod.RETAIL_OUTLET;
    case "CREDIT_CARD":
    case "CARD":
      return XenditPaymentMethod.CREDIT_CARD;
    default:
      return XenditPaymentMethod.VIRTUAL_ACCOUNT; // Default to VA
  }
}

/**
 * Parse payment method details
 */
function parsePaymentMethodDetails(paymentMethod: string, details: any = {}) {
  const method = parsePaymentMethod(paymentMethod);

  switch (method) {
    case XenditPaymentMethod.VIRTUAL_ACCOUNT:
      return {
        virtualAccount: {
          bankCode: details.bankCode || VirtualAccountBank.BCA,
        },
      };
    case XenditPaymentMethod.EWALLET:
      return {
        ewallet: {
          type: details.type || EWalletType.OVO,
          redirectUrl:
            details.redirectUrl ||
            `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/buyer/orders`,
        },
      };
    case XenditPaymentMethod.QR_CODE:
      return {
        qrCode: {
          type: QRCodeType.QRIS,
        },
      };
    case XenditPaymentMethod.RETAIL_OUTLET:
      return {
        retailOutlet: {
          type: details.type || RetailOutletType.ALFAMART,
        },
      };
    default:
      return {};
  }
}

/**
 * Map payment method string to Mock payment method enum
 */
function mapPaymentMethodToMock(paymentMethod: string): MockPaymentMethod {
  switch (paymentMethod.toUpperCase()) {
    case "QRIS_BY_WONDERS":
      return MockPaymentMethod.QRIS_BY_WONDERS;
    default:
      return MockPaymentMethod.QRIS_BY_WONDERS; // Default to QRIS By Wonders
  }
}

/**
 * Extract checkout URL from Xendit payment response
 */
function extractCheckoutUrl(xenditPayment: any): string | null {
  if (xenditPayment.actions && xenditPayment.actions.length > 0) {
    // Look for redirect action
    const redirectAction = xenditPayment.actions.find(
      (action: any) => action.action === "AUTH" || action.action === "REDIRECT",
    );

    if (redirectAction && redirectAction.url) {
      return redirectAction.url;
    }
  }

  // For some payment methods like VA, there might not be a redirect URL
  return null;
}

/**
 * Send ticket delivery email with PDF attachments after successful payment and QR code generation
 */
async function sendTicketDeliveryEmailWithPDF(orderId: string): Promise<void> {
  try {
    // Get order with all related data
    const order = await prisma.transaction.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        event: true,
        tickets: {
          include: {
            ticketType: true,
            ticketHolder: true,
          },
        },
        buyerInfo: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Get the email to send to (buyer info email or user email)
    const emailTo = order.buyerInfo?.email || order.user.email;

    if (!emailTo) {
      throw new Error("No email address found for order");
    }

    // Format event date and time
    const eventDate = new Date(order.event.startDate).toLocaleDateString(
      "id-ID",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );

    const eventTime = order.event.startTime || "Waktu akan diumumkan";
    const customerName =
      order.buyerInfo?.fullName || order.user.name || "Customer";

    // Format payment date
    const paymentDate =
      new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB";

    // Send ticket delivery email with PDF attachments only
    await emailService.sendTicketDeliveryWithPDF({
      to: emailTo,
      customerName,
      event: {
        title: order.event.title,
        date: eventDate,
        time: eventTime,
        location: order.event.venue,
        address: `${order.event.address}, ${order.event.city}, ${order.event.province}`,
        image: order.event.posterUrl || undefined,
      },
      order: {
        invoiceNumber: order.invoiceNumber,
        totalAmount: Number(order.amount),
        paymentDate,
      },
      tickets: order.tickets.map((ticket) => ({
        id: ticket.id,
        ticketNumber: ticket.id,
        ticketType: ticket.ticketType.name,
        holderName: ticket.ticketHolder?.fullName || customerName,
        qrCode: ticket.qrCodeImageUrl || undefined,
        // Additional fields needed for PDF generation
        eventId: order.event.id,
        userId: order.userId,
        transactionId: order.id,
        ticketTypeId: ticket.ticketTypeId,
        eventDate: order.event.startDate,
      })),
    });

    console.log(
      `✅ Ticket delivery email with PDF sent to ${emailTo} for order ${order.invoiceNumber}`,
    );
  } catch (error) {
    console.error("Error sending ticket delivery email with PDF:", error);
    throw error;
  }
}

/**
 * Send ticket delivery email after successful payment and QR code generation (legacy method)
 */
async function sendTicketDeliveryEmail(orderId: string): Promise<void> {
  try {
    // Get order with all related data
    const order = await prisma.transaction.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        event: true,
        tickets: {
          include: {
            ticketType: true,
            ticketHolder: true,
          },
        },
        buyerInfo: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Get the email to send to (buyer info email or user email)
    const emailTo = order.buyerInfo?.email || order.user.email;

    if (!emailTo) {
      throw new Error("No email address found for order");
    }

    // Format event date and time
    const eventDate = new Date(order.event.startDate).toLocaleDateString(
      "id-ID",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );

    const eventTime = order.event.startTime || "Waktu akan diumumkan";
    const customerName =
      order.buyerInfo?.fullName || order.user.name || "Customer";

    // Format payment date
    const paymentDate =
      new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB";

    // Send email with tickets
    await emailService.sendTicketDelivery({
      to: emailTo,
      customerName,
      event: {
        title: order.event.title,
        date: eventDate,
        time: eventTime,
        location: order.event.venue,
        address: `${order.event.address}, ${order.event.city}, ${order.event.province}`,
        image: order.event.posterUrl || undefined,
      },
      order: {
        invoiceNumber: order.invoiceNumber,
        totalAmount: Number(order.amount),
        paymentDate,
      },
      tickets: order.tickets.map((ticket) => ({
        id: ticket.id,
        ticketNumber: ticket.id,
        ticketType: ticket.ticketType.name,
        holderName: ticket.ticketHolder?.fullName || customerName,
        qrCode: ticket.qrCodeImageUrl || undefined,
      })),
    });

    console.log(
      `✅ Ticket delivery email sent to ${emailTo} for order ${order.invoiceNumber}`,
    );
  } catch (error) {
    console.error("Error sending ticket delivery email:", error);
    throw error;
  }
}
