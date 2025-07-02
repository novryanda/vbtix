import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { handleBulkPurchaseTickets } from "~/server/api/buyer-tickets";
import { organizerOrderCreateSchema } from "~/lib/validations/organizer-order.schema";
import { UserRole, PaymentStatus, TicketStatus } from "@prisma/client";
import { prisma } from "~/server/db";
import { generateTransactionQRCodes } from "~/server/services/ticket-qr.service";
import { emailService } from "~/lib/email-service";
import { generateUniqueCode } from "~/lib/utils/generators";

/**
 * POST /api/organizer/[id]/orders/create
 * Create a new order as an organizer
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only organizers can create orders
    if (session.user.role !== UserRole.ORGANIZER) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Only organizers can create orders" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Parse and validate request body
    const body = await request.json();
    
    const validationResult = organizerOrderCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Create the complete order with tickets and buyer info
    const orderData = validationResult.data;

    // Validate that all order items belong to the same event
    const eventIds = [...new Set(orderData.orderItems.map(item => item.eventId))];
    if (eventIds.length > 1) {
      return NextResponse.json(
        { success: false, error: "All order items must belong to the same event" },
        { status: 400 }
      );
    }

    const eventId = eventIds[0];
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = orderData.orderItems.reduce(
      (sum: number, item: any) => sum + (item.price * item.quantity),
      0
    ) - (orderData.discountAmount || 0);

    // Validate ticket availability for SUCCESS payments (immediate sales)
    if (orderData.paymentStatus === "SUCCESS") {
      for (const item of orderData.orderItems) {
        const ticketType = await prisma.ticketType.findUnique({
          where: { id: item.ticketTypeId },
          select: { quantity: true, sold: true, reserved: true }
        });

        if (!ticketType) {
          return NextResponse.json(
            { success: false, error: `Ticket type ${item.ticketTypeId} not found` },
            { status: 404 }
          );
        }

        const available = ticketType.quantity - ticketType.sold - ticketType.reserved;
        if (available < item.quantity) {
          return NextResponse.json(
            { success: false, error: `Insufficient tickets available for ${item.ticketTypeId}. Available: ${available}, Requested: ${item.quantity}` },
            { status: 400 }
          );
        }
      }
    }

    // Create the complete order in a transaction
    const result = await prisma.$transaction(
      async (tx) => {
        // Create transaction
        const transaction = await tx.transaction.create({
          data: {
            userId: session.user.id,
            eventId,
            amount: Math.max(0, totalAmount),
            currency: "IDR",
            paymentMethod: orderData.paymentMethod || "MANUAL",
            status: (orderData.paymentStatus as PaymentStatus) || PaymentStatus.PENDING,
            invoiceNumber: `ORG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            orderItems: {
              create: orderData.orderItems.map((item: any) => ({
                ticketTypeId: item.ticketTypeId,
                quantity: item.quantity,
                price: item.price,
              }))
            }
          },
          include: {
            orderItems: true,
            event: true
          }
        });

        // Create buyer info
        await tx.buyerInfo.create({
          data: {
            transactionId: transaction.id,
            fullName: orderData.customerInfo.fullName,
            identityType: orderData.customerInfo.identityType,
            identityNumber: orderData.customerInfo.identityNumber,
            email: orderData.customerInfo.email,
            whatsapp: orderData.customerInfo.whatsapp,
          },
        });

        // Create tickets for each order item
        const ticketData = [];
        let ticketIndex = 0;

        // Determine ticket status based on payment status
        // Manual tickets created by organizers with SUCCESS payment status are immediately ACTIVE
        const ticketStatus = orderData.paymentStatus === "SUCCESS" ? TicketStatus.ACTIVE : TicketStatus.PENDING;

        for (const item of orderData.orderItems) {
          for (let i = 0; i < item.quantity; i++) {
            const qrCode = generateUniqueCode();
            const ticketId = `ticket_${Date.now()}_${ticketIndex}_${Math.random().toString(36).substring(2, 11)}`;

            ticketData.push({
              id: ticketId,
              ticketTypeId: item.ticketTypeId,
              transactionId: transaction.id,
              userId: session.user.id,
              qrCode,
              status: ticketStatus, // ACTIVE for SUCCESS payments, PENDING for others
            });
            ticketIndex++;
          }
        }

        // Batch create tickets
        const createdTickets = await tx.ticket.createManyAndReturn({
          data: ticketData,
        });

        // For manual tickets with SUCCESS payment status, immediately increment sold count
        // This treats organizer-created tickets as direct sales
        if (orderData.paymentStatus === "SUCCESS") {
          for (const item of orderData.orderItems) {
            await tx.ticketType.update({
              where: { id: item.ticketTypeId },
              data: {
                sold: {
                  increment: item.quantity,
                },
              },
            });
          }
        }

        return { transaction, tickets: createdTickets };
      },
      {
        maxWait: 10000, // 10 seconds
        timeout: 15000, // 15 seconds
      },
    );

    const order = result.transaction;

    // Track email delivery status
    let emailDeliverySuccess = false;
    let emailDeliveryError = null;

    // If payment status is SUCCESS, generate QR codes and send email
    if (orderData.paymentStatus === "SUCCESS") {
      try {
        console.log(`🎫 Generating QR codes for organizer-created order: ${order.id}`);

        // Generate QR codes for the order
        const qrResult = await generateTransactionQRCodes(order.id);
        console.log(`🎫 QR code generation result: ${qrResult.generatedCount} generated, errors:`, qrResult.errors);

        if (!qrResult.success && qrResult.errors.length > 0) {
          console.warn(`⚠️ Some QR codes failed to generate for order ${order.id}:`, qrResult.errors);
        }

        // Send email notification with tickets
        try {
          console.log(`📧 Sending ticket delivery email for organizer-created order: ${order.id}`);

          // Get the complete order with all relations for email
          const completeOrder = await prisma.transaction.findUnique({
            where: { id: order.id },
            include: {
              event: true,
              buyerInfo: true,
              user: true,
              tickets: {
                include: {
                  ticketType: true,
                  ticketHolder: true,
                },
              },
            },
          });

          if (!completeOrder) {
            throw new Error("Order not found after creation");
          }

          const emailTo = completeOrder.buyerInfo?.email || completeOrder.user.email;

          if (emailTo) {
            // Format event date and time
            const eventDate = new Date(completeOrder.event.startDate).toLocaleDateString(
              "id-ID",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              },
            );

            const eventTime = completeOrder.event.startTime || "Waktu akan diumumkan";
            const customerName = completeOrder.buyerInfo?.fullName || completeOrder.user.name || "Customer";

            // Format payment date
            const paymentDate = new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }) + " WIB";

            // Send ticket delivery email with PDF attachments
            try {
              const pdfEmailResult = await emailService.sendTicketDeliveryWithPDF({
                to: emailTo,
                customerName,
                event: {
                  title: completeOrder.event.title,
                  date: eventDate,
                  time: eventTime,
                  location: completeOrder.event.venue,
                  address: `${completeOrder.event.address}, ${completeOrder.event.city}, ${completeOrder.event.province}`,
                  image: completeOrder.event.posterUrl || undefined,
                },
                order: {
                  invoiceNumber: completeOrder.invoiceNumber,
                  totalAmount: Number(completeOrder.amount),
                  paymentDate,
                },
                tickets: completeOrder.tickets.map((ticket) => ({
                  id: ticket.id,
                  ticketNumber: ticket.id,
                  ticketType: ticket.ticketType.name,
                  holderName: ticket.ticketHolder?.fullName || customerName,
                  qrCode: ticket.qrCodeImageUrl || undefined,
                  // Additional fields needed for PDF generation
                  eventId: completeOrder.event.id,
                  userId: completeOrder.userId,
                  transactionId: completeOrder.id,
                  ticketTypeId: ticket.ticketTypeId,
                  eventDate: completeOrder.event.startDate,
                })),
              });

              // Check if email was actually sent successfully
              if (pdfEmailResult.success) {
                console.log(
                  `✅ Organizer order creation: Ticket delivery email with PDF sent to ${emailTo} for order ${completeOrder.invoiceNumber}`,
                );
                emailDeliverySuccess = true;
              } else {
                console.error(
                  `❌ PDF email failed for order ${completeOrder.invoiceNumber}:`,
                  pdfEmailResult.error
                );
                throw new Error(pdfEmailResult.error || "PDF email delivery failed");
              }
            } catch (pdfError) {
              console.error("Failed to send PDF email, falling back to regular email:", pdfError);

              // Fallback to regular email
              try {
                const fallbackEmailResult = await emailService.sendTicketDelivery({
                  to: emailTo,
                  customerName,
                  event: {
                    title: completeOrder.event.title,
                    date: eventDate,
                    time: eventTime,
                    location: completeOrder.event.venue,
                    address: `${completeOrder.event.address}, ${completeOrder.event.city}, ${completeOrder.event.province}`,
                    image: completeOrder.event.posterUrl || undefined,
                  },
                  order: {
                    invoiceNumber: completeOrder.invoiceNumber,
                    totalAmount: Number(completeOrder.amount),
                    paymentDate,
                  },
                  tickets: completeOrder.tickets.map((ticket) => ({
                    id: ticket.id,
                    ticketNumber: ticket.id,
                    ticketType: ticket.ticketType.name,
                    holderName: ticket.ticketHolder?.fullName || customerName,
                    qrCode: ticket.qrCodeImageUrl || undefined,
                  })),
                });

                // Check if fallback email was sent successfully
                if (fallbackEmailResult.success) {
                  console.log(
                    `✅ Organizer order creation: Fallback ticket delivery email sent to ${emailTo} for order ${completeOrder.invoiceNumber}`,
                  );
                  emailDeliverySuccess = true;
                } else {
                  console.error(
                    `❌ Fallback email also failed for order ${completeOrder.invoiceNumber}:`,
                    fallbackEmailResult.error
                  );
                  throw new Error(fallbackEmailResult.error || "Both PDF and fallback email delivery failed");
                }
              } catch (fallbackError) {
                console.error("Fallback email also failed:", fallbackError);
                throw fallbackError;
              }
            }
          } else {
            console.warn(`⚠️ No email address found for order ${order.id}`);
          }
        } catch (emailError) {
          console.error("Failed to send ticket email for organizer-created order:", emailError);
          emailDeliveryError = emailError.message || "Email delivery failed";
          // Don't fail the order creation if email fails
        }
      } catch (qrError) {
        console.error(`❌ Error generating QR codes for organizer-created order ${order.id}:`, qrError);
        // Don't fail the order creation if QR generation fails
      }
    }

    // Return success response with accurate email delivery status
    const responseMessage = orderData.paymentStatus === "SUCCESS"
      ? emailDeliverySuccess
        ? "Order created successfully and tickets sent to customer email"
        : emailDeliveryError
          ? `Order created successfully but email delivery failed: ${emailDeliveryError}`
          : "Order created successfully but email delivery status unknown"
      : "Order created successfully";

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        invoiceNumber: order.invoiceNumber,
        amount: order.amount.toString(),
        status: order.status,
        createdAt: order.createdAt,
        emailSent: emailDeliverySuccess,
        emailError: emailDeliveryError,
      },
      message: responseMessage,
    });

  } catch (error: any) {
    console.error("Error creating organizer order:", error);
    
    // Handle specific error types
    if (error.message.includes("not an organizer")) {
      return NextResponse.json(
        { success: false, error: "User is not an organizer" },
        { status: 403 }
      );
    }
    
    if (error.message.includes("not found") || error.message.includes("not owned")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }
    
    if (error.message.includes("Insufficient tickets")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create order",
      },
      { status: 500 }
    );
  }
}
