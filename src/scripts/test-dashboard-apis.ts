/**
 * Test script for dashboard API endpoints
 * This script can be used to verify that all dashboard APIs are working correctly
 */

import { getAdminDashboardStats, getAdminSalesAnalytics, getVisitorAnalytics, getOrganizerSalesAnalytics } from "~/server/services/dashboard.service";

async function testAdminDashboardStats() {
  console.log("Testing Admin Dashboard Stats...");
  try {
    const stats = await getAdminDashboardStats();
    console.log("✅ Admin Dashboard Stats:", {
      totalEvents: stats.totalEvents,
      totalUsers: stats.totalUsers,
      totalSales: stats.totalSales,
      totalTicketsSold: stats.totalTicketsSold,
      todaysSales: stats.todaysSales,
    });
    return true;
  } catch (error) {
    console.error("❌ Admin Dashboard Stats failed:", error);
    return false;
  }
}

async function testAdminSalesAnalytics() {
  console.log("Testing Admin Sales Analytics...");
  try {
    const analytics = await getAdminSalesAnalytics("30d");
    console.log("✅ Admin Sales Analytics:", {
      dataPoints: analytics.length,
      sampleData: analytics.slice(0, 3),
    });
    return true;
  } catch (error) {
    console.error("❌ Admin Sales Analytics failed:", error);
    return false;
  }
}

async function testVisitorAnalytics() {
  console.log("Testing Visitor Analytics...");
  try {
    const analytics = await getVisitorAnalytics("30d");
    console.log("✅ Visitor Analytics:", {
      dataPoints: analytics.length,
      sampleData: analytics.slice(0, 3),
    });
    return true;
  } catch (error) {
    console.error("❌ Visitor Analytics failed:", error);
    return false;
  }
}

async function testOrganizerSalesAnalytics() {
  console.log("Testing Organizer Sales Analytics...");
  try {
    // This would need a real organizer ID in a real test
    const analytics = await getOrganizerSalesAnalytics("test-organizer-id", "30d");
    console.log("✅ Organizer Sales Analytics:", {
      dataPoints: analytics.length,
      sampleData: analytics.slice(0, 3),
    });
    return true;
  } catch (error) {
    console.error("❌ Organizer Sales Analytics failed:", error);
    return false;
  }
}

export async function runDashboardTests() {
  console.log("🚀 Starting Dashboard API Tests...\n");
  
  const results = await Promise.allSettled([
    testAdminDashboardStats(),
    testAdminSalesAnalytics(),
    testVisitorAnalytics(),
    testOrganizerSalesAnalytics(),
  ]);

  const passed = results.filter(result => 
    result.status === "fulfilled" && result.value === true
  ).length;

  const total = results.length;

  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log("🎉 All dashboard API tests passed!");
  } else {
    console.log("⚠️  Some tests failed. Check the logs above for details.");
  }

  return { passed, total, success: passed === total };
}

// Export individual test functions for selective testing
export {
  testAdminDashboardStats,
  testAdminSalesAnalytics,
  testVisitorAnalytics,
  testOrganizerSalesAnalytics,
};
