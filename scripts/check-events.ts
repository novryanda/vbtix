/**
 * Script to check what events exist in the database
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkEvents() {
  try {
    console.log("Checking events in database...");

    const events = await prisma.event.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        organizerId: true,
      },
    });

    console.log(`Found ${events.length} events:`);
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   ID: ${event.id}`);
      console.log(`   Slug: ${event.slug}`);
      console.log(`   Status: ${event.status}`);
      console.log(`   Organizer ID: ${event.organizerId}`);
      console.log("");
    });

    // Check if our test event exists
    const testEvent = await prisma.event.findFirst({
      where: {
        slug: "tech-conference-2024-test",
      },
      include: {
        ticketTypes: true,
      },
    });

    if (testEvent) {
      console.log("✅ Test event found:");
      console.log(`   Title: ${testEvent.title}`);
      console.log(`   ID: ${testEvent.id}`);
      console.log(`   Slug: ${testEvent.slug}`);
      console.log(`   Status: ${testEvent.status}`);
      console.log(`   Ticket Types: ${testEvent.ticketTypes.length}`);
      testEvent.ticketTypes.forEach((ticket) => {
        console.log(`     - ${ticket.name}: IDR ${ticket.price}`);
      });
    } else {
      console.log("❌ Test event not found");
    }

  } catch (error) {
    console.error("Error checking events:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEvents();
