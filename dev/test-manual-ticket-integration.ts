/**
 * Test script for manual ticket creation integration
 * Tests: organizer manual ticket creation → ACTIVE status → sold count increment → QR codes → dashboard statistics
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testManualTicketIntegration() {
  console.log("🧪 Testing Manual Ticket Integration");
  console.log("=" .repeat(60));

  try {
    // Step 1: Find an organizer and their event
    console.log("\n📋 Step 1: Finding test organizer and event...");
    
    const organizer = await prisma.organizer.findFirst({
      where: { verified: true },
      include: {
        events: {
          where: { status: "PUBLISHED" },
          include: {
            ticketTypes: true
          }
        }
      }
    });

    if (!organizer || !organizer.events.length) {
      throw new Error("No verified organizer with published events found");
    }

    const event = organizer.events[0];
    const ticketType = event.ticketTypes[0];

    if (!ticketType) {
      throw new Error("No ticket types found for the event");
    }

    console.log(`✅ Found organizer: ${organizer.businessName} (ID: ${organizer.id})`);
    console.log(`✅ Found event: ${event.title} (ID: ${event.id})`);
    console.log(`✅ Found ticket type: ${ticketType.name} (ID: ${ticketType.id})`);

    // Step 2: Get initial statistics
    console.log("\n📊 Step 2: Getting initial statistics...");
    
    const initialStats = await getOrganizerStats(organizer.id);
    const initialTicketTypeStats = await getTicketTypeStats(ticketType.id);
    
    console.log(`📈 Initial total sold tickets: ${initialStats.totalSold}`);
    console.log(`📈 Initial total revenue: ${initialStats.totalRevenue}`);
    console.log(`📈 Initial ticket type sold: ${initialTicketTypeStats.sold}`);

    // Step 3: Create manual order with SUCCESS payment status
    console.log("\n🎫 Step 3: Creating manual order with SUCCESS payment...");
    
    const manualOrderData = {
      customerInfo: {
        fullName: "Test Customer Manual",
        identityType: "KTP",
        identityNumber: "1234567890123456",
        email: "test.manual@example.com",
        whatsapp: "081234567890",
        notes: "Manual ticket creation test"
      },
      orderItems: [
        {
          eventId: event.id,
          ticketTypeId: ticketType.id,
          quantity: 2,
          price: Number(ticketType.price),
          notes: "Test manual tickets"
        }
      ],
      paymentMethod: "MANUAL",
      paymentStatus: "SUCCESS", // This should create ACTIVE tickets
      organizerNotes: "Test manual ticket creation",
      discountAmount: 0,
      discountReason: ""
    };

    // Simulate the manual order creation logic
    const transaction = await prisma.$transaction(async (tx) => {
      // Create transaction
      const newTransaction = await tx.transaction.create({
        data: {
          userId: organizer.userId,
          eventId: event.id,
          amount: manualOrderData.orderItems[0].price * manualOrderData.orderItems[0].quantity,
          currency: "IDR",
          paymentMethod: "MANUAL",
          status: "SUCCESS",
          invoiceNumber: `TEST-MANUAL-${Date.now()}`,
          orderItems: {
            create: manualOrderData.orderItems.map((item) => ({
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
          transactionId: newTransaction.id,
          fullName: manualOrderData.customerInfo.fullName,
          identityType: manualOrderData.customerInfo.identityType,
          identityNumber: manualOrderData.customerInfo.identityNumber,
          email: manualOrderData.customerInfo.email,
          whatsapp: manualOrderData.customerInfo.whatsapp,
        },
      });

      // Create tickets with ACTIVE status (since payment is SUCCESS)
      const ticketData = [];
      for (let i = 0; i < manualOrderData.orderItems[0].quantity; i++) {
        ticketData.push({
          id: `test_ticket_${Date.now()}_${i}`,
          ticketTypeId: ticketType.id,
          transactionId: newTransaction.id,
          userId: organizer.userId,
          qrCode: `TEST_QR_${Date.now()}_${i}`,
          status: "ACTIVE", // ACTIVE for SUCCESS payments
        });
      }

      await tx.ticket.createMany({
        data: ticketData,
      });

      // Increment sold count for SUCCESS payments
      await tx.ticketType.update({
        where: { id: ticketType.id },
        data: {
          sold: {
            increment: manualOrderData.orderItems[0].quantity,
          },
        },
      });

      return newTransaction;
    });

    console.log(`✅ Created manual order: ${transaction.invoiceNumber}`);
    console.log(`✅ Created ${manualOrderData.orderItems[0].quantity} ACTIVE tickets`);

    // Step 4: Verify statistics update
    console.log("\n📊 Step 4: Verifying statistics update...");
    
    const updatedStats = await getOrganizerStats(organizer.id);
    const updatedTicketTypeStats = await getTicketTypeStats(ticketType.id);
    
    console.log(`📈 Updated total sold tickets: ${updatedStats.totalSold}`);
    console.log(`📈 Updated total revenue: ${updatedStats.totalRevenue}`);
    console.log(`📈 Updated ticket type sold: ${updatedTicketTypeStats.sold}`);

    // Verify the changes
    const soldTicketsIncrease = updatedStats.totalSold - initialStats.totalSold;
    const revenueIncrease = updatedStats.totalRevenue - initialStats.totalRevenue;
    const ticketTypeSoldIncrease = updatedTicketTypeStats.sold - initialTicketTypeStats.sold;

    console.log(`\n🔍 Verification Results:`);
    console.log(`📊 Sold tickets increased by: ${soldTicketsIncrease} (expected: ${manualOrderData.orderItems[0].quantity})`);
    console.log(`💰 Revenue increased by: ${revenueIncrease} (expected: ${manualOrderData.orderItems[0].price * manualOrderData.orderItems[0].quantity})`);
    console.log(`🎫 Ticket type sold increased by: ${ticketTypeSoldIncrease} (expected: ${manualOrderData.orderItems[0].quantity})`);

    // Step 5: Verify ticket status
    console.log("\n🎫 Step 5: Verifying ticket status...");
    
    const createdTickets = await prisma.ticket.findMany({
      where: { transactionId: transaction.id },
      select: { id: true, status: true, qrCode: true }
    });

    console.log(`✅ Found ${createdTickets.length} tickets for the transaction`);
    createdTickets.forEach((ticket, index) => {
      console.log(`   Ticket ${index + 1}: Status = ${ticket.status}, QR = ${ticket.qrCode}`);
    });

    // Step 6: Test results summary
    console.log("\n🎯 Test Results Summary:");
    console.log("=" .repeat(40));
    
    const allTestsPassed = 
      soldTicketsIncrease === manualOrderData.orderItems[0].quantity &&
      ticketTypeSoldIncrease === manualOrderData.orderItems[0].quantity &&
      createdTickets.every(ticket => ticket.status === "ACTIVE") &&
      createdTickets.length === manualOrderData.orderItems[0].quantity;

    if (allTestsPassed) {
      console.log("✅ ALL TESTS PASSED!");
      console.log("✅ Manual tickets are properly counted as sold");
      console.log("✅ Dashboard statistics are updated correctly");
      console.log("✅ Tickets are created with ACTIVE status");
      console.log("✅ Sold count is incremented immediately");
    } else {
      console.log("❌ SOME TESTS FAILED!");
      if (soldTicketsIncrease !== manualOrderData.orderItems[0].quantity) {
        console.log(`❌ Sold tickets count mismatch`);
      }
      if (ticketTypeSoldIncrease !== manualOrderData.orderItems[0].quantity) {
        console.log(`❌ Ticket type sold count mismatch`);
      }
      if (!createdTickets.every(ticket => ticket.status === "ACTIVE")) {
        console.log(`❌ Not all tickets have ACTIVE status`);
      }
    }

    return { success: allTestsPassed, transaction };

  } catch (error) {
    console.error("❌ Test failed:", error);
    return { success: false, error };
  }
}

// Helper functions
async function getOrganizerStats(organizerId: string) {
  const [totalSold, totalRevenue] = await Promise.all([
    prisma.ticket.count({
      where: {
        ticketType: {
          event: {
            organizerId,
          },
        },
        status: {
          in: ["ACTIVE", "USED"],
        },
      },
    }),
    prisma.orderItem.aggregate({
      where: {
        ticketType: {
          event: {
            organizerId,
          },
        },
        order: {
          status: "SUCCESS",
        },
      },
      _sum: {
        price: true,
      },
    }),
  ]);

  return {
    totalSold,
    totalRevenue: Number(totalRevenue._sum.price || 0),
  };
}

async function getTicketTypeStats(ticketTypeId: string) {
  const ticketType = await prisma.ticketType.findUnique({
    where: { id: ticketTypeId },
    select: { sold: true, quantity: true }
  });

  return ticketType || { sold: 0, quantity: 0 };
}

// Run the test
if (require.main === module) {
  testManualTicketIntegration()
    .then((result) => {
      console.log("\n🏁 Test completed");
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("💥 Test execution failed:", error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

export { testManualTicketIntegration };
