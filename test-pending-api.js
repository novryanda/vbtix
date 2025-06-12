// Test script to check the pending events API endpoint
import fetch from 'node-fetch';

async function testPendingEventsAPI() {
  try {
    console.log('Testing /api/admin/events/pending endpoint...');
    
    // Note: This will fail without proper authentication, but we can see the response
    const response = await fetch('http://localhost:3001/api/admin/events/pending', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // In a real test, we would need to include the session token
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Response body:', data);
    
    if (response.status === 401) {
      console.log('\n✓ API endpoint exists and requires authentication (expected)');
    } else if (response.status === 200) {
      console.log('\n✓ API endpoint is working');
      try {
        const jsonData = JSON.parse(data);
        console.log('Parsed JSON:', jsonData);
      } catch (e) {
        console.log('Response is not JSON');
      }
    } else {
      console.log('\n✗ Unexpected response status');
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testPendingEventsAPI();
