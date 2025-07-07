import { prisma } from "~/server/db";
import { handlePurchaseFromReservation } from "~/server/api/buyer-tickets";
import { handleInitiateCheckout } from "~/server/api/checkout";
import { handleUpdateOrderStatus } from "~/server/api/admin-orders";
import { PaymentStatus } from "@prisma/client";

async function testNewTicketFlow() {
  console.log("🧪 Testing New Ticket Creation Flow");
  console.log("=====================================");

  try {
    // Step 1: Find a test event and ticket type
    const event = await prisma.event.findFirst({
      where: { status: "PUBLISHED" },
      include: { ticketTypes: true },
    });

    if (!event || event.ticketTypes.length === 0) {
      console.log("❌ No published events with ticket types found");
      return;
    }

    const ticketType = event.ticketTypes[0];
    console.log(`📅 Using event: ${event.title}`);
    console.log(`🎫 Using ticket type: ${ticketType.name} (${ticketType.sold} sold)`);

    // Step 2: Find a test user
    const user = await prisma.user.findFirst({
      where: { role: "BUYER" },
    });

    if (!user) {
      console.log("❌ No buyer users found");
      return;
    }

    console.log(`👤 Using user: ${user.email}`);

    // Step 3: Create a test transaction directly (simulating reservation purchase)
    console.log("\n🔄 Step 1: Creating test transaction...");

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        eventId: event.id,
        amount: ticketType.price,
        currency: "IDR",
        status: "PENDING",
        paymentMethod: "PENDING", // Will be set during checkout
        invoiceNumber: `TEST-${Date.now()}`,
        orderItems: {
          create: [
            {
              ticketTypeId: ticketType.id,
              quantity: 1,
              price: ticketType.price,
            },
          ],
        },
        details: {
          ticketHolders: [
            {
              fullName: "Test Holder",
              identityType: "KTP",
              identityNumber: "1234567890",
              email: "test@example.com",
              whatsapp: "081234567890",
              ticketIndex: 0,
            },
          ],
        },
      },
      include: {
        tickets: true,
        orderItems: true,
      },
    });

    console.log(`✅ Transaction created: ${transaction.id}`);
    console.log(`🎫 Tickets created: ${transaction.tickets.length} (should be 0)`);

    // Step 4: Initiate checkout (should create tickets)
    console.log("\n🔄 Step 2: Initiating checkout with payment method...");

    const checkoutResult = await handleInitiateCheckout({
      orderId: transaction.id,
      paymentMethod: "MANUAL_PAYMENT",
      userId: user.id,
    });

    console.log(`✅ Checkout initiated: ${checkoutResult.order.id}`);
    console.log(`💳 Payment method: ${checkoutResult.order.paymentMethod}`);

    // Check if tickets were created
    const orderWithTickets = await prisma.transaction.findUnique({
      where: { id: transaction.id },
      include: { tickets: true },
    });

    console.log(`🎫 Tickets after checkout: ${orderWithTickets?.tickets.length || 0} (should be 1)`);
    console.log(`📊 Ticket status: ${orderWithTickets?.tickets[0]?.status || "N/A"} (should be PENDING)`);

    // Step 5: Check sold count (should not be incremented yet)
    const ticketTypeAfterCheckout = await prisma.ticketType.findUnique({
      where: { id: ticketType.id },
    });

    console.log(`📈 Sold count after checkout: ${ticketTypeAfterCheckout?.sold} (should be ${ticketType.sold})`);

    // Step 6: Admin approval (should activate tickets and increment sold count)
    console.log("\n🔄 Step 3: Admin approval...");
    
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!adminUser) {
      console.log("❌ No admin users found");
      return;
    }

    await handleUpdateOrderStatus({
      orderId: transaction.id,
      status: PaymentStatus.SUCCESS,
      notes: "Test approval",
      adminId: adminUser.id,
    });

    // Step 7: Verify final state
    const finalOrder = await prisma.transaction.findUnique({
      where: { id: transaction.id },
      include: { tickets: true },
    });

    const finalTicketType = await prisma.ticketType.findUnique({
      where: { id: ticketType.id },
    });

    console.log(`✅ Final order status: ${finalOrder?.status}`);
    console.log(`🎫 Final ticket status: ${finalOrder?.tickets[0]?.status || "N/A"} (should be ACTIVE)`);
    console.log(`📈 Final sold count: ${finalTicketType?.sold} (should be ${ticketType.sold + 1})`);

    console.log("\n🎉 Test completed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testNewTicketFlow();
