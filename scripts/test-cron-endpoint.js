#!/usr/bin/env node

/**
 * Test Script for Cron Cleanup Endpoint
 * 
 * This script tests the cron endpoint for PENDING ticket cleanup
 */

// Using built-in fetch (Node.js 18+)

const BASE_URL = 'http://localhost:3000';
const ENDPOINT = '/api/cron/cleanup-pending-tickets';

async function testCronEndpoint() {
  console.log('🧪 Testing Cron Cleanup Endpoint');
  console.log('==================================\n');

  try {
    // Test 1: GET with dry-run
    console.log('📊 Test 1: GET with dry-run (statistics only)');
    const response1 = await fetch(`${BASE_URL}${ENDPOINT}?dryRun=true&maxAge=24`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ GET dry-run successful:');
      console.log(`   Status: ${data1.success}`);
      console.log(`   Message: ${data1.message}`);
      console.log(`   PENDING tickets: ${data1.data?.statistics?.totalPendingTickets || 0}`);
      console.log(`   Eligible for deletion: ${data1.data?.statistics?.eligibleForDeletion || 0}`);
      console.log(`   Execution time: ${data1.data?.executionTimeMs || 0}ms`);
    } else {
      console.log(`❌ GET dry-run failed: ${response1.status} ${response1.statusText}`);
      const errorText = await response1.text();
      console.log(`   Error: ${errorText}`);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: POST with statistics only
    console.log('📊 Test 2: POST with statistics only');
    const response2 = await fetch(`${BASE_URL}${ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        statsOnly: true,
        maxAge: 24,
        includeFailedPayments: true,
      }),
    });

    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ POST statistics successful:');
      console.log(`   Status: ${data2.success}`);
      console.log(`   Message: ${data2.message}`);
      console.log(`   PENDING tickets: ${data2.data?.statistics?.totalPendingTickets || 0}`);
      console.log(`   Eligible for deletion: ${data2.data?.statistics?.eligibleForDeletion || 0}`);
      
      // Show detailed statistics
      const stats = data2.data?.statistics;
      if (stats) {
        console.log('\n   📈 Detailed Statistics:');
        console.log(`      Tickets by Age:`);
        console.log(`        Under 1 hour: ${stats.ticketsByAge?.under1Hour || 0}`);
        console.log(`        Under 24 hours: ${stats.ticketsByAge?.under24Hours || 0}`);
        console.log(`        Under 7 days: ${stats.ticketsByAge?.under7Days || 0}`);
        console.log(`        Over 7 days: ${stats.ticketsByAge?.over7Days || 0}`);
        
        console.log(`      Tickets by Payment Status:`);
        console.log(`        Pending payments: ${stats.ticketsByPaymentStatus?.pending || 0}`);
        console.log(`        Failed payments: ${stats.ticketsByPaymentStatus?.failed || 0}`);
        console.log(`        Expired payments: ${stats.ticketsByPaymentStatus?.expired || 0}`);
      }
    } else {
      console.log(`❌ POST statistics failed: ${response2.status} ${response2.statusText}`);
      const errorText = await response2.text();
      console.log(`   Error: ${errorText}`);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: POST with dry-run cleanup
    console.log('📊 Test 3: POST with dry-run cleanup (maxAge=1 hour)');
    const response3 = await fetch(`${BASE_URL}${ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dryRun: true,
        maxAge: 1, // 1 hour to catch any tickets
        batchSize: 100,
        includeFailedPayments: true,
      }),
    });

    if (response3.ok) {
      const data3 = await response3.json();
      console.log('✅ POST dry-run cleanup successful:');
      console.log(`   Status: ${data3.success}`);
      console.log(`   Message: ${data3.message}`);
      console.log(`   Would delete: ${data3.data?.cleanup?.deletedTickets || 0} tickets`);
      console.log(`   Execution time: ${data3.data?.executionTimeMs || 0}ms`);
      
      if (data3.data?.cleanup) {
        const cleanup = data3.data.cleanup;
        console.log(`   Affected transactions: ${cleanup.affectedTransactions || 0}`);
        console.log(`   Affected ticket types: ${cleanup.affectedTicketTypes?.length || 0}`);
      }
    } else {
      console.log(`❌ POST dry-run cleanup failed: ${response3.status} ${response3.statusText}`);
      const errorText = await response3.text();
      console.log(`   Error: ${errorText}`);
    }

    console.log('\n🎉 Cron endpoint testing completed!');
    console.log('\n💡 Usage Examples:');
    console.log('   # Daily cleanup (24 hours)');
    console.log(`   curl -X GET "${BASE_URL}${ENDPOINT}?maxAge=24&includeFailedPayments=true"`);
    console.log('\n   # Weekly cleanup (1 hour threshold)');
    console.log(`   curl -X POST "${BASE_URL}${ENDPOINT}" -H "Content-Type: application/json" -d '{"maxAge":1,"includeFailedPayments":true}'`);
    console.log('\n   # Statistics only');
    console.log(`   curl -X POST "${BASE_URL}${ENDPOINT}" -H "Content-Type: application/json" -d '{"statsOnly":true}'`);

  } catch (error) {
    console.error('❌ Error testing cron endpoint:', error.message);
    console.log('\n💡 Make sure the development server is running:');
    console.log('   npm run dev');
  }
}

// Run test
testCronEndpoint()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  });
