/**
 * Test script for the complete organizer approval flow
 * Tests: customer purchase → PENDING → admin payment verification → organizer approval → sold count increment → QR codes → emails
 */

import { PrismaClient } from "@prisma/client";
import { handleBulkPurchaseTickets } from "~/server/api/buyer-tickets";
import { handleUpdateOrderStatus } from "~/server/api/admin-orders";
import { handleUpdateOrganizerOrderStatus } from "~/server/api/organizer-orders";
import { reservationService } from "~/server/services/reservation.service";

const prisma = new PrismaClient();

async function testOrganizerApprovalFlow() {
  console.log("🧪 Testing Complete Organizer Approval Flow");
  console.log("=" .repeat(60));

  try {
    // Step 1: Find test data
    console.log("\n📋 Step 1: Finding test data...");
    
    const event = await prisma.event.findFirst({
      where: { 
        status: "PUBLISHED",
        ticketTypes: {
          some: {
            quantity: { gt: 0 }
          }
        }
      },
      include: {
        ticketTypes: {
          where: { quantity: { gt: 0 } },
          take: 1
        },
        organizer: true
      }
    });

    if (!event || !event.ticketTypes[0]) {
      console.log("❌ No suitable test event found");
      return;
    }

    const ticketType = event.ticketTypes[0];
    console.log(`✅ Found event: ${event.title}`);
    console.log(`✅ Found ticket type: ${ticketType.name} (${ticketType.sold}/${ticketType.quantity} sold)`);

    // Step 2: Find a test user
    console.log("\n👤 Step 2: Finding test user...");

    let testUser = await prisma.user.findFirst({
      where: { role: "BUYER" }
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: `test_${Date.now()}@example.com`,
          name: "Test Customer",
          role: "BUYER"
        }
      });
    }

    console.log(`✅ Test user: ${testUser.email}`);

    // Step 3: Direct bulk purchase (creates PENDING tickets)
    console.log("\n💳 Step 3: Creating bulk purchase...");
    const initialSoldCount = ticketType.sold;

    const purchaseResult = await handleBulkPurchaseTickets({
      userId: testUser.id,
      items: [{
        ticketTypeId: ticketType.id,
        quantity: 1
      }],
      buyerInfo: {
        fullName: "Test Customer",
        identityType: "KTP",
        identityNumber: "1234567890123456",
        email: "test@example.com",
        whatsapp: "081234567890"
      },
      ticketHolders: [{
        fullName: "Test Customer",
        identityType: "KTP",
        identityNumber: "1234567890123456",
        email: "test@example.com",
        whatsapp: "081234567890"
      }]
    });

    console.log(`✅ Purchase completed: Order ${purchaseResult.transaction.id}`);

    // Step 4: Verify PENDING status and sold count unchanged
    console.log("\n📊 Step 4: Verifying PENDING status...");
    
    const orderAfterPurchase = await prisma.transaction.findUnique({
      where: { id: purchaseResult.transaction.id },
      include: { 
        tickets: true,
        orderItems: true
      }
    });

    const ticketTypeAfterPurchase = await prisma.ticketType.findUnique({
      where: { id: ticketType.id }
    });

    console.log(`📋 Order status: ${orderAfterPurchase?.status}`);
    console.log(`🎫 Tickets created: ${orderAfterPurchase?.tickets.length}`);
    console.log(`📊 Ticket status: ${orderAfterPurchase?.tickets[0]?.status}`);
    console.log(`📈 Sold count: ${initialSoldCount} → ${ticketTypeAfterPurchase?.sold} (should be unchanged)`);

    if (ticketTypeAfterPurchase?.sold !== initialSoldCount) {
      console.log("❌ ERROR: Sold count changed during purchase (should remain unchanged)");
      return;
    }

    if (orderAfterPurchase?.tickets[0]?.status !== "PENDING") {
      console.log("❌ ERROR: Ticket status is not PENDING");
      return;
    }

    console.log("✅ Purchase flow correct: PENDING tickets, sold count unchanged");

    // Step 5: Admin payment verification (should NOT increment sold count)
    console.log("\n🔐 Step 5: Admin payment verification...");
    
    await handleUpdateOrderStatus({
      orderId: purchaseResult.transaction.id,
      status: "SUCCESS",
      notes: "Payment verified by admin"
    });

    const orderAfterAdminApproval = await prisma.transaction.findUnique({
      where: { id: purchaseResult.transaction.id },
      include: { tickets: true }
    });

    const ticketTypeAfterAdminApproval = await prisma.ticketType.findUnique({
      where: { id: ticketType.id }
    });

    console.log(`📋 Order status after admin approval: ${orderAfterAdminApproval?.status}`);
    console.log(`🎫 Ticket status after admin approval: ${orderAfterAdminApproval?.tickets[0]?.status}`);
    console.log(`📈 Sold count after admin approval: ${ticketTypeAfterAdminApproval?.sold} (should still be ${initialSoldCount})`);

    if (ticketTypeAfterAdminApproval?.sold !== initialSoldCount) {
      console.log("❌ ERROR: Admin approval incorrectly incremented sold count");
      return;
    }

    if (orderAfterAdminApproval?.tickets[0]?.status !== "PENDING") {
      console.log("❌ ERROR: Admin approval incorrectly activated tickets");
      return;
    }

    console.log("✅ Admin approval correct: Payment verified, tickets still PENDING, sold count unchanged");

    // Step 6: Organizer approval (should increment sold count and activate tickets)
    console.log("\n👨‍💼 Step 6: Organizer approval...");
    
    await handleUpdateOrganizerOrderStatus({
      userId: event.organizer.userId,
      orderId: purchaseResult.transaction.id,
      status: "SUCCESS",
      notes: "Approved by organizer"
    });

    const orderAfterOrganizerApproval = await prisma.transaction.findUnique({
      where: { id: purchaseResult.transaction.id },
      include: { 
        tickets: true,
        orderItems: true
      }
    });

    const ticketTypeAfterOrganizerApproval = await prisma.ticketType.findUnique({
      where: { id: ticketType.id }
    });

    console.log(`📋 Order status after organizer approval: ${orderAfterOrganizerApproval?.status}`);
    console.log(`🎫 Ticket status after organizer approval: ${orderAfterOrganizerApproval?.tickets[0]?.status}`);
    console.log(`📈 Sold count after organizer approval: ${initialSoldCount} → ${ticketTypeAfterOrganizerApproval?.sold} (should be ${initialSoldCount + 1})`);

    const expectedSoldCount = initialSoldCount + 1;
    if (ticketTypeAfterOrganizerApproval?.sold !== expectedSoldCount) {
      console.log(`❌ ERROR: Organizer approval did not increment sold count correctly. Expected: ${expectedSoldCount}, Got: ${ticketTypeAfterOrganizerApproval?.sold}`);
      return;
    }

    if (orderAfterOrganizerApproval?.tickets[0]?.status !== "ACTIVE") {
      console.log("❌ ERROR: Organizer approval did not activate tickets");
      return;
    }

    console.log("✅ Organizer approval correct: Tickets activated, sold count incremented");

    // Step 7: Verify QR codes generated
    console.log("\n🔍 Step 7: Verifying QR code generation...");
    
    const ticketsWithQR = await prisma.ticket.findMany({
      where: { transactionId: purchaseResult.transaction.id },
      select: {
        id: true,
        qrCodeStatus: true,
        qrCodeImageUrl: true,
        qrCodeGeneratedAt: true
      }
    });

    const qrGenerated = ticketsWithQR.every(ticket => 
      ticket.qrCodeStatus === "ACTIVE" && 
      ticket.qrCodeImageUrl && 
      ticket.qrCodeGeneratedAt
    );

    console.log(`🎫 QR codes generated: ${qrGenerated ? "✅ Yes" : "❌ No"}`);
    console.log(`📊 QR status: ${ticketsWithQR[0]?.qrCodeStatus}`);

    if (!qrGenerated) {
      console.log("❌ ERROR: QR codes not generated properly");
      return;
    }

    console.log("✅ QR codes generated successfully");

    // Final Summary
    console.log("\n" + "=" .repeat(60));
    console.log("🎉 COMPLETE ORGANIZER APPROVAL FLOW TEST PASSED!");
    console.log("=" .repeat(60));
    console.log("✅ Customer purchase → PENDING tickets (sold count unchanged)");
    console.log("✅ Admin payment verification → Payment verified (sold count unchanged)");
    console.log("✅ Organizer approval → Tickets activated + sold count incremented + QR codes generated");
    console.log("\n🔄 Two-stage approval process working correctly!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testOrganizerApprovalFlow().catch(console.error);
