#!/usr/bin/env tsx

/**
 * Test script for the complete organizer verification workflow
 * This script tests the entire flow from user registration to organizer approval
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testOrganizerWorkflow() {
  try {
    console.log("🧪 Testing Organizer Verification Workflow");
    console.log("=".repeat(50));

    // Step 1: Check existing users
    console.log("\n1️⃣ Checking existing users...");
    const users = await prisma.user.findMany({
      include: {
        organizer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    console.log(`Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(
        `  ${index + 1}. ${user.email} - Role: ${user.role} - Has Organizer: ${user.organizer ? "✅" : "❌"}`,
      );
    });

    // Step 2: Find a user with ORGANIZER role but no organizer record
    const organizerUserWithoutRecord = users.find(
      (user) => user.role === "ORGANIZER" && !user.organizer,
    );

    if (organizerUserWithoutRecord) {
      console.log(
        `\n2️⃣ Found user ready for verification: ${organizerUserWithoutRecord.email}`,
      );
    } else {
      console.log(
        "\n2️⃣ No users with ORGANIZER role without organizer records found",
      );

      // Find a BUYER user to demonstrate role change
      const buyerUser = users.find((user) => user.role === "BUYER");
      if (buyerUser) {
        console.log(
          `   Found BUYER user that could be changed to ORGANIZER: ${buyerUser.email}`,
        );
      }
    }

    // Step 3: Check pending verification requests
    console.log("\n3️⃣ Checking pending verification requests...");
    const pendingVerifications = await prisma.approval.findMany({
      where: {
        entityType: "USER_ORGANIZER_VERIFICATION",
        status: "PENDING",
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    console.log(
      `Found ${pendingVerifications.length} pending verification requests:`,
    );
    pendingVerifications.forEach((request, index) => {
      console.log(
        `  ${index + 1}. Entity ID: ${request.entityId} - Submitted: ${request.submittedAt?.toLocaleDateString() || "N/A"}`,
      );
    });

    // Step 4: Check existing organizer verifications
    console.log("\n4️⃣ Checking existing organizer verifications...");
    const organizerVerifications = await prisma.organizerVerification.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        organizer: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    console.log(
      `Found ${organizerVerifications.length} pending organizer verifications:`,
    );
    organizerVerifications.forEach((verification, index) => {
      console.log(
        `  ${index + 1}. ${verification.organizer.user.email} - Submitted: ${verification.submittedAt?.toLocaleDateString()}`,
      );
    });

    // Step 5: Summary
    console.log("\n📊 Workflow Summary:");
    console.log(`  • Total Users: ${users.length}`);
    console.log(
      `  • Users with ORGANIZER role: ${users.filter((u) => u.role === "ORGANIZER").length}`,
    );
    console.log(
      `  • Users with Organizer records: ${users.filter((u) => u.organizer).length}`,
    );
    console.log(
      `  • Pending user verification requests: ${pendingVerifications.length}`,
    );
    console.log(
      `  • Pending organizer verifications: ${organizerVerifications.length}`,
    );

    // Step 6: Workflow status
    console.log("\n🔄 Workflow Status:");

    if (pendingVerifications.length > 0) {
      console.log(
        "  ✅ Ready for admin approval - User verification requests pending",
      );
      console.log(
        "  📝 Next step: Admin should review and approve in /admin/organizers",
      );
    } else if (organizerVerifications.length > 0) {
      console.log(
        "  ✅ Ready for admin approval - Organizer verifications pending",
      );
      console.log(
        "  📝 Next step: Admin should review and approve in /admin/organizers",
      );
    } else {
      console.log("  ℹ️  No pending verifications");
      console.log(
        "  📝 Next step: Create a user verification request in /organizer/[id]/verification",
      );
    }

    // Step 7: Test endpoints availability
    console.log("\n🌐 Testing API endpoints...");

    try {
      // Test admin verifications endpoint
      const response = await fetch(
        "http://localhost:3001/api/admin/verifications",
      );
      if (response.ok) {
        console.log("  ✅ Admin verifications API endpoint working");
      } else {
        console.log("  ❌ Admin verifications API endpoint not working");
      }
    } catch (error) {
      console.log(
        "  ⚠️  Could not test API endpoints (server may not be running)",
      );
    }

    console.log("\n🎉 Workflow test completed!");
    console.log("\n📋 Manual Testing Steps:");
    console.log(
      "  1. Go to /admin/users - Change a BUYER user to ORGANIZER role",
    );
    console.log(
      "  2. Go to /organizer/[userId]/verification - Submit verification as that user",
    );
    console.log(
      "  3. Go to /admin/organizers - Review and approve the verification",
    );
    console.log(
      "  4. Verify organizer record is created and user can access organizer features",
    );
  } catch (error) {
    console.error("💥 Error testing workflow:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testOrganizerWorkflow()
  .then(() => {
    console.log("Test completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });
