#!/usr/bin/env node

/**
 * Simple Test for Cron Cleanup Endpoint using curl
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const BASE_URL = 'http://localhost:3001';
const ENDPOINT = '/api/cron/cleanup-pending-tickets';

async function testWithCurl(description, curlCommand) {
  console.log(`\n📊 ${description}`);
  console.log('='.repeat(50));
  
  try {
    const { stdout, stderr } = await execAsync(curlCommand);
    
    if (stderr && !stderr.includes('progress')) {
      console.log(`⚠️  Warning: ${stderr}`);
    }
    
    if (stdout) {
      try {
        const data = JSON.parse(stdout);
        console.log('✅ Response received:');
        console.log(`   Success: ${data.success}`);
        console.log(`   Message: ${data.message || 'No message'}`);
        
        if (data.data?.statistics) {
          const stats = data.data.statistics;
          console.log(`   PENDING tickets: ${stats.totalPendingTickets || 0}`);
          console.log(`   Eligible for deletion: ${stats.eligibleForDeletion || 0}`);
        }
        
        if (data.data?.cleanup) {
          const cleanup = data.data.cleanup;
          console.log(`   Would delete: ${cleanup.deletedTickets || 0} tickets`);
        }
        
        console.log(`   Execution time: ${data.data?.executionTimeMs || 0}ms`);
      } catch (parseError) {
        console.log('📄 Raw response:');
        console.log(stdout);
      }
    } else {
      console.log('❌ No response received');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Make sure the development server is running: npm run dev');
    }
  }
}

async function testCronEndpoint() {
  console.log('🧪 Testing Cron Cleanup Endpoint with curl');
  console.log('==========================================');

  // Test 1: GET with dry-run
  await testWithCurl(
    'Test 1: GET with dry-run',
    `curl -s -X GET "${BASE_URL}${ENDPOINT}?dryRun=true&maxAge=24" -H "Content-Type: application/json"`
  );

  // Test 2: POST with statistics only
  await testWithCurl(
    'Test 2: POST with statistics only',
    `curl -s -X POST "${BASE_URL}${ENDPOINT}" -H "Content-Type: application/json" -d '{"statsOnly":true,"maxAge":24}'`
  );

  // Test 3: POST with dry-run cleanup (1 hour threshold)
  await testWithCurl(
    'Test 3: POST with dry-run cleanup (1 hour threshold)',
    `curl -s -X POST "${BASE_URL}${ENDPOINT}" -H "Content-Type: application/json" -d '{"dryRun":true,"maxAge":1,"includeFailedPayments":true}'`
  );

  console.log('\n🎉 Cron endpoint testing completed!');
  console.log('\n💡 Usage Examples for Production:');
  console.log('   # Daily cleanup via cron job');
  console.log(`   curl -X GET "${BASE_URL}${ENDPOINT}?maxAge=24&includeFailedPayments=true"`);
  console.log('\n   # Manual cleanup with POST');
  console.log(`   curl -X POST "${BASE_URL}${ENDPOINT}" \\`);
  console.log(`        -H "Content-Type: application/json" \\`);
  console.log(`        -d '{"maxAge":24,"includeFailedPayments":true}'`);
  console.log('\n   # Statistics check');
  console.log(`   curl -X POST "${BASE_URL}${ENDPOINT}" \\`);
  console.log(`        -H "Content-Type: application/json" \\`);
  console.log(`        -d '{"statsOnly":true}'`);
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
