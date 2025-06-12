#!/usr/bin/env node

/**
 * Test script to trigger the sales API error
 * Run with: node test-sales-api.js
 */

async function testSalesAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Sales API to reproduce the error...\n');
  
  try {
    // Test the sales API endpoint that was causing issues
    const response = await fetch(`${baseUrl}/api/organizer/test-user-id/sales`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📡 Sales API Response Status:', response.status);
    console.log('📡 Sales API Response Headers:', [...response.headers.entries()]);
    
    const data = await response.text();
    console.log('📡 Sales API Response Body:', data);
    
    if (!response.ok) {
      console.log('\n❌ API Error detected! This confirms our issue.');
      
      try {
        const jsonData = JSON.parse(data);
        if (jsonData.error) {
          console.log('🔍 Error message:', jsonData.error);
        }
      } catch (e) {
        console.log('🔍 Raw error response:', data);
      }
    } else {
      console.log('\n✅ API call successful');
    }
    
  } catch (error) {
    console.log('\n💥 Network/Fetch Error:', error.message);
    console.log('🔍 This might be the error we\'re looking for in the fetcher function');
  }
}

// Also test a few other organizer endpoints
async function testOtherEndpoints() {
  console.log('\n🧪 Testing other organizer endpoints...\n');
  
  const endpoints = [
    '/api/organizer/test-user-id/dashboard',
    '/api/organizer/test-user-id/events',
    '/api/organizer/test-user-id/orders'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint}`);
      const response = await fetch(`http://localhost:3000${endpoint}`);
      console.log(`  Status: ${response.status}`);
      
      if (!response.ok) {
        const data = await response.text();
        try {
          const jsonData = JSON.parse(data);
          console.log(`  Error: ${jsonData.error || 'Unknown error'}`);
        } catch (e) {
          console.log(`  Raw response: ${data.substring(0, 100)}...`);
        }
      }
    } catch (error) {
      console.log(`  Network Error: ${error.message}`);
    }
    console.log('');
  }
}

// Run the tests
testSalesAPI().then(() => {
  return testOtherEndpoints();
}).then(() => {
  console.log('🎯 Test completed! Check the logs above for the error details.');
}).catch(console.error);
