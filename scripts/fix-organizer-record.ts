#!/usr/bin/env tsx

/**
 * Script to fix organizer records for users with ORGANIZER role
 * This script creates missing organizer records for users who have the ORGANIZER role
 * but don't have a corresponding record in the Organizer table.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixOrganizerRecords() {
  try {
    console.log(
      "🔍 Checking for users with ORGANIZER role but no organizer record...",
    );

    // Find users with ORGANIZER role
    const organizerUsers = await prisma.user.findMany({
      where: {
        role: "ORGANIZER",
      },
      include: {
        organizer: true,
      },
    });

    console.log(`📊 Found ${organizerUsers.length} users with ORGANIZER role`);

    // Filter users who don't have organizer records
    const usersWithoutOrganizerRecord = organizerUsers.filter(
      (user) => !user.organizer,
    );

    console.log(
      `🚨 Found ${usersWithoutOrganizerRecord.length} users without organizer records`,
    );

    if (usersWithoutOrganizerRecord.length === 0) {
      console.log("✅ All organizer users have proper organizer records!");
      return;
    }

    // Create organizer records for users who don't have them
    for (const user of usersWithoutOrganizerRecord) {
      console.log(
        `🔧 Creating organizer record for user: ${user.email} (${user.id})`,
      );

      try {
        const organizer = await prisma.organizer.create({
          data: {
            userId: user.id,
            orgName: user.name || "Organizer",
            verified: false,
          },
        });

        console.log(`✅ Created organizer record with ID: ${organizer.id}`);
      } catch (error) {
        console.error(
          `❌ Failed to create organizer record for user ${user.email}:`,
          error,
        );
      }
    }

    console.log("🎉 Finished fixing organizer records!");
  } catch (error) {
    console.error("💥 Error fixing organizer records:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixOrganizerRecords()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });

export { fixOrganizerRecords };
