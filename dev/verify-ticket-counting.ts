/**
 * Simple verification script to check ticket counting logic
 * This script verifies that dashboard statistics only count ACTIVE and USED tickets
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyTicketCounting() {
  console.log("🔍 Verifying Ticket Counting Logic");
  console.log("=" .repeat(50));

  try {
    // 1. Check total tickets by status
    console.log("📊 Current Ticket Status Distribution:");
    
    const ticketsByStatus = await prisma.ticket.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    ticketsByStatus.forEach(group => {
      console.log(`   ${group.status}: ${group._count.status} tickets`);
    });

    // 2. Calculate what should be counted as "sold"
    const activePlusUsed = ticketsByStatus
      .filter(group => group.status === 'ACTIVE' || group.status === 'USED')
      .reduce((sum, group) => sum + group._count.status, 0);

    const pendingTickets = ticketsByStatus
      .filter(group => group.status === 'PENDING')
      .reduce((sum, group) => sum + group._count.status, 0);

    console.log("\n📈 Expected Counts:");
    console.log(`   Should count as SOLD: ${activePlusUsed} (ACTIVE + USED)`);
    console.log(`   Should NOT count: ${pendingTickets} (PENDING)`);

    // 3. Test dashboard service functions
    console.log("\n🧪 Testing Dashboard Functions:");
    
    // Import dashboard functions
    const { getAdminDashboardStats } = await import("~/server/services/dashboard.service");
    
    const dashboardStats = await getAdminDashboardStats();
    console.log(`   Dashboard Total Tickets Sold: ${dashboardStats.totalTicketsSold}`);
    console.log(`   Dashboard Today's Tickets: ${dashboardStats.todaysTickets}`);

    // 4. Verify the counts match
    console.log("\n✅ Verification Results:");
    
    const dashboardMatches = dashboardStats.totalTicketsSold === activePlusUsed;
    console.log(`   Dashboard count matches expected: ${dashboardMatches ? '✅ PASS' : '❌ FAIL'}`);
    
    if (!dashboardMatches) {
      console.log(`     Expected: ${activePlusUsed}, Got: ${dashboardStats.totalTicketsSold}`);
    }

    // 5. Test individual counting functions
    console.log("\n🔧 Testing Individual Functions:");
    
    const { ticketService } = await import("~/server/services/ticket.service");
    
    // Get a sample event to test with
    const sampleEvent = await prisma.event.findFirst({
      include: {
        ticketTypes: {
          include: {
            tickets: true,
          },
        },
      },
    });

    if (sampleEvent) {
      const eventSoldCount = await ticketService.countSoldTicketsByEventId(sampleEvent.id);
      
      // Calculate expected count for this event
      const expectedEventCount = sampleEvent.ticketTypes.reduce((sum, ticketType) => {
        return sum + ticketType.tickets.filter(ticket => 
          ticket.status === 'ACTIVE' || ticket.status === 'USED'
        ).length;
      }, 0);

      console.log(`   Event "${sampleEvent.title}" sold count: ${eventSoldCount}`);
      console.log(`   Expected for this event: ${expectedEventCount}`);
      
      const eventMatches = eventSoldCount === expectedEventCount;
      console.log(`   Event count matches: ${eventMatches ? '✅ PASS' : '❌ FAIL'}`);
    }

    // 6. Summary
    console.log("\n📋 Summary:");
    console.log(`   Total tickets in system: ${ticketsByStatus.reduce((sum, group) => sum + group._count.status, 0)}`);
    console.log(`   Tickets counted as sold: ${activePlusUsed} (ACTIVE + USED only)`);
    console.log(`   Tickets excluded: ${pendingTickets} (PENDING)`);
    console.log(`   Dashboard shows: ${dashboardStats.totalTicketsSold}`);
    
    if (dashboardMatches) {
      console.log("   🎉 Ticket counting logic is working correctly!");
    } else {
      console.log("   ⚠️  Ticket counting logic needs attention.");
    }

  } catch (error) {
    console.error("❌ Verification failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification
verifyTicketCounting().catch(console.error);
