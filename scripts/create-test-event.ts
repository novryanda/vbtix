/**
 * Script to create a test event for testing the mock payment system
 * Run with: npx tsx scripts/create-test-event.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestEvent() {
  try {
    console.log("Creating test event for mock payment testing...");

    // First, check if we have any organizers
    let organizer = await prisma.organizer.findFirst({
      where: {
        user: {
          role: "ORGANIZER",
        },
      },
    });

    if (!organizer) {
      console.log("No organizer found, creating test organizer...");

      // Create a test user with organizer role
      const testUser = await prisma.user.create({
        data: {
          email: "test-organizer@vbticket.com",
          name: "Test Organizer",
          role: "ORGANIZER",
          phone: "+6281234567890",
        },
      });

      // Create organizer profile
      organizer = await prisma.organizer.create({
        data: {
          userId: testUser.id,          orgName: "VBTicket Test Events",
          legalName: "VBTicket Test Events Ltd",
          npwp: "123456789012345",
          verified: true,
        },
      });

      console.log("Test organizer created:", organizer.orgName);
    }

    // Create test event
    const testEvent = await prisma.event.create({
      data: {
        slug: "tech-conference-2024-test",
        organizerId: organizer.id,
        title: "Tech Conference 2024 - Test Event",
        description:
          "A test event for demonstrating the mock payment system. This is a comprehensive technology conference featuring the latest trends in software development, AI, and digital transformation.",
        category: "Technology",
        venue: "Jakarta Convention Center",
        address: "Jl. Jendral Gatot Subroto, Jakarta Selatan",
        city: "Jakarta",
        province: "DKI Jakarta",
        country: "Indonesia",
        tags: ["technology", "conference", "test", "mock-payment"],
        startDate: new Date("2024-12-15T09:00:00Z"),
        endDate: new Date("2024-12-15T17:00:00Z"),
        status: "PUBLISHED",
        maxAttendees: 1000,
        website: "https://techconf2024.test",
        terms: "This is a test event for mock payment system demonstration.",
      },
    });

    console.log("Test event created:", testEvent.title);

    // Create ticket types
    const ticketTypes = await Promise.all([
      prisma.ticketType.create({
        data: {
          eventId: testEvent.id,
          name: "Early Bird",
          description: "Early bird special pricing - limited time offer",
          price: 250000,
          currency: "IDR",
          quantity: 100,
          sold: 25,
          maxPerPurchase: 5,
          isVisible: true,
          allowTransfer: true,
          ticketFeatures: "Access to all sessions, welcome kit, lunch",
          perks: "Priority seating, networking session access",
          saleStartDate: new Date("2024-11-01T00:00:00Z"),
          saleEndDate: new Date("2024-12-10T23:59:59Z"),
        },
      }),
      prisma.ticketType.create({
        data: {
          eventId: testEvent.id,
          name: "Regular",
          description: "Standard conference ticket",
          price: 350000,
          currency: "IDR",
          quantity: 500,
          sold: 150,
          maxPerPurchase: 10,
          isVisible: true,
          allowTransfer: true,
          ticketFeatures: "Access to all sessions, welcome kit, lunch",
          perks: "Standard seating, networking session access",
          saleStartDate: new Date("2024-11-01T00:00:00Z"),
          saleEndDate: new Date("2024-12-14T23:59:59Z"),
        },
      }),
      prisma.ticketType.create({
        data: {
          eventId: testEvent.id,
          name: "VIP",
          description: "Premium experience with exclusive benefits",
          price: 750000,
          currency: "IDR",
          quantity: 50,
          sold: 10,
          maxPerPurchase: 3,
          isVisible: true,
          allowTransfer: false,
          ticketFeatures:
            "Access to all sessions, premium welcome kit, VIP lunch, exclusive workshop",
          perks:
            "VIP seating, exclusive networking session, meet & greet with speakers",
          saleStartDate: new Date("2024-11-01T00:00:00Z"),
          saleEndDate: new Date("2024-12-14T23:59:59Z"),
        },
      }),
    ]);

    console.log("Ticket types created:");
    ticketTypes.forEach((ticket) => {
      console.log(`- ${ticket.name}: IDR ${ticket.price.toLocaleString()}`);
    });

    console.log("\n✅ Test event setup complete!");
    console.log("\n📋 Test Event Details:");
    console.log(`Event ID: ${testEvent.id}`);
    console.log(`Event Slug: ${testEvent.slug}`);
    console.log(`Event Title: ${testEvent.title}`);
    console.log(`Organizer: ${organizer.orgName}`);
    console.log(`URL: http://localhost:3001/events/${testEvent.slug}`);

    console.log("\n🎯 To test the mock payment system:");
    console.log("1. Go to the event page");
    console.log("2. Select tickets and click 'Beli Tiket'");
    console.log("3. Fill out the purchase form");
    console.log(
      "4. Use the 'Samakan dengan data pemesan' checkbox to copy buyer data",
    );
    console.log("5. Click 'Lanjut ke Pembayaran'");
    console.log(
      "6. Select a test payment method (you should see 'MODE TEST' indicators)",
    );
    console.log("7. Complete the test payment simulation");
  } catch (error) {
    console.error("Error creating test event:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTestEvent();
