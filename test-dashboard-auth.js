/**
 * Test dashboard endpoint dengan authentication
 */

const BASE_URL = 'http://localhost:3000';

async function testWithAuth() {
  console.log('🔐 Testing Dashboard dengan Authentication\n');

  try {
    // Step 1: Login untuk mendapatkan session
    console.log('1. Mencoba login untuk mendapatkan session...');
    
    // Get CSRF token first
    const csrfResponse = await fetch(`${BASE_URL}/api/auth/csrf`);
    const csrfData = await csrfResponse.json();
    console.log('   CSRF token obtained');

    // Try to login (ini akan gagal karena kita belum tahu kredensial yang benar)
    console.log('\n2. Mencoba mengakses session info...');
    const sessionResponse = await fetch(`${BASE_URL}/api/auth/session`);
    const sessionData = await sessionResponse.json();
    console.log('   Session data:', JSON.stringify(sessionData, null, 2));

    // Step 3: Test dashboard endpoint dengan cookie yang mungkin ada
    console.log('\n3. Testing dashboard endpoint...');
    const dashboardResponse = await fetch(`${BASE_URL}/api/admin/dashboard?limit=5`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`   Status: ${dashboardResponse.status}`);
    const dashboardData = await dashboardResponse.json();
    console.log('   Response:', JSON.stringify(dashboardData, null, 2));

    if (dashboardResponse.status === 500) {
      console.log('\n❌ Internal Server Error - Check server logs');
      console.log('Mari check terminal output untuk melihat error detail');
    } else if (dashboardResponse.status === 401) {
      console.log('\n✅ Expected 401 - Authentication working correctly');
    }

  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : String(error));
  }
}

testWithAuth();
