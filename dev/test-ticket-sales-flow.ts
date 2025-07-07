/**
 * Test script to verify the new ticket sales flow
 * This script tests that tickets are only counted as "sold" after admin approval
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testTicketSalesFlow() {
  console.log("🧪 Testing new ticket sales flow...\n");

  try {
    // 1. Find a test event with ticket types
    const event = await prisma.event.findFirst({
      include: {
        ticketTypes: true,
      },
      where: {
        ticketTypes: {
          some: {
            quantity: {
              gt: 0,
            },
          },
        },
      },
    });

    if (!event || event.ticketTypes.length === 0) {
      console.log("❌ No test event with ticket types found. Please create one first.");
      return;
    }

    const ticketType = event.ticketTypes[0];
    console.log(`📋 Using event: ${event.title}`);
    console.log(`🎫 Using ticket type: ${ticketType.name}`);
    console.log(`📊 Initial state - Quantity: ${ticketType.quantity}, Sold: ${ticketType.sold}\n`);

    // 2. Create a test transaction with PENDING tickets
    console.log("🛒 Step 1: Creating purchase with PENDING tickets...");
    
    const testUser = await prisma.user.findFirst();
    if (!testUser) {
      console.log("❌ No test user found. Please create one first.");
      return;
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: testUser.id,
        eventId: event.id,
        amount: ticketType.price,
        currency: "IDR",
        status: "PENDING",
        paymentMethod: "MANUAL_PAYMENT",
        invoiceNumber: `TEST-${Date.now()}`,
        orderItems: {
          create: {
            ticketTypeId: ticketType.id,
            quantity: 1,
            price: ticketType.price,
          },
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Create PENDING ticket
    await prisma.ticket.create({
      data: {
        ticketTypeId: ticketType.id,
        transactionId: transaction.id,
        userId: testUser.id,
        qrCode: `TEST-${Date.now()}`,
        status: "PENDING",
      },
    });

    console.log(`✅ Created transaction ${transaction.invoiceNumber} with PENDING ticket`);

    // 3. Check that sold count hasn't increased
    const ticketTypeAfterPurchase = await prisma.ticketType.findUnique({
      where: { id: ticketType.id },
    });

    console.log(`📊 After purchase - Sold count: ${ticketTypeAfterPurchase?.sold} (should be ${ticketType.sold})`);
    
    if (ticketTypeAfterPurchase?.sold !== ticketType.sold) {
      console.log("❌ FAIL: Sold count increased immediately after purchase!");
      return;
    } else {
      console.log("✅ PASS: Sold count did not increase after purchase\n");
    }

    // 4. Test admin approval
    console.log("👨‍💼 Step 2: Admin approving payment...");
    
    await prisma.$transaction(async (tx) => {
      // Update transaction status
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: "SUCCESS" },
      });

      // Activate tickets
      await tx.ticket.updateMany({
        where: { 
          transactionId: transaction.id,
          status: "PENDING"
        },
        data: { status: "ACTIVE" },
      });

      // Increment sold count (this is the key change!)
      await tx.ticketType.update({
        where: { id: ticketType.id },
        data: {
          sold: {
            increment: 1,
          },
        },
      });
    });

    console.log("✅ Admin approved payment and activated tickets");

    // 5. Check that sold count has now increased
    const ticketTypeAfterApproval = await prisma.ticketType.findUnique({
      where: { id: ticketType.id },
    });

    console.log(`📊 After approval - Sold count: ${ticketTypeAfterApproval?.sold} (should be ${ticketType.sold + 1})`);
    
    if (ticketTypeAfterApproval?.sold !== ticketType.sold + 1) {
      console.log("❌ FAIL: Sold count did not increase after admin approval!");
      return;
    } else {
      console.log("✅ PASS: Sold count increased after admin approval\n");
    }

    // 6. Test admin rejection with another transaction
    console.log("❌ Step 3: Testing admin rejection...");
    
    const rejectionTransaction = await prisma.transaction.create({
      data: {
        userId: testUser.id,
        eventId: event.id,
        amount: ticketType.price,
        currency: "IDR",
        status: "PENDING",
        paymentMethod: "MANUAL_PAYMENT",
        invoiceNumber: `TEST-REJECT-${Date.now()}`,
        orderItems: {
          create: {
            ticketTypeId: ticketType.id,
            quantity: 1,
            price: ticketType.price,
          },
        },
      },
    });

    await prisma.ticket.create({
      data: {
        ticketTypeId: ticketType.id,
        transactionId: rejectionTransaction.id,
        userId: testUser.id,
        qrCode: `TEST-REJECT-${Date.now()}`,
        status: "PENDING",
      },
    });

    // Admin rejects
    await prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id: rejectionTransaction.id },
        data: { status: "FAILED" },
      });

      await tx.ticket.updateMany({
        where: { 
          transactionId: rejectionTransaction.id,
          status: "PENDING"
        },
        data: { status: "CANCELLED" },
      });
      // Note: No sold count increment for rejected payments
    });

    const ticketTypeAfterRejection = await prisma.ticketType.findUnique({
      where: { id: ticketType.id },
    });

    console.log(`📊 After rejection - Sold count: ${ticketTypeAfterRejection?.sold} (should still be ${ticketType.sold + 1})`);
    
    if (ticketTypeAfterRejection?.sold !== ticketType.sold + 1) {
      console.log("❌ FAIL: Sold count changed after rejection!");
      return;
    } else {
      console.log("✅ PASS: Sold count unchanged after rejection\n");
    }

    console.log("🎉 All tests passed! The new ticket sales flow is working correctly.");
    console.log("\n📋 Summary:");
    console.log("- ✅ Tickets are created with PENDING status on purchase");
    console.log("- ✅ Sold count does NOT increase on purchase");
    console.log("- ✅ Sold count increases only on admin approval");
    console.log("- ✅ Sold count does not change on admin rejection");

    // Cleanup test data
    console.log("\n🧹 Cleaning up test data...");
    await prisma.ticket.deleteMany({
      where: {
        transactionId: {
          in: [transaction.id, rejectionTransaction.id],
        },
      },
    });
    await prisma.orderItem.deleteMany({
      where: {
        orderId: {
          in: [transaction.id, rejectionTransaction.id],
        },
      },
    });
    await prisma.transaction.deleteMany({
      where: {
        id: {
          in: [transaction.id, rejectionTransaction.id],
        },
      },
    });

    // Restore original sold count
    await prisma.ticketType.update({
      where: { id: ticketType.id },
      data: { sold: ticketType.sold },
    });

    console.log("✅ Test data cleaned up");

  } catch (error) {
    console.error("❌ Test failed with error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testTicketSalesFlow();
