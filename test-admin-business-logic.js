/**
 * Test admin business logic functions
 */

// Import functions directly
async function testAdminBusinessLogic() {
  console.log('🧪 Testing Admin Business Logic\n');

  try {
    // Dynamically import the admin business logic
    const adminModule = await import('./src/server/api/admin.js');
    
    console.log('1. Testing handleGetDashboardStats...');
    try {
      const stats = await adminModule.handleGetDashboardStats();
      console.log('   ✅ Dashboard stats:', JSON.stringify(stats, null, 2));
    } catch (error) {
      console.log(`   ❌ Dashboard stats failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    console.log('\n2. Testing handleGetRecentEvents...');
    try {
      const events = await adminModule.handleGetRecentEvents(5);
      console.log(`   ✅ Recent events count: ${events.length}`);
    } catch (error) {
      console.log(`   ❌ Recent events failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    console.log('\n3. Testing handleGetRecentOrganizers...');
    try {
      const organizers = await adminModule.handleGetRecentOrganizers(5);
      console.log(`   ✅ Recent organizers count: ${organizers.length}`);
    } catch (error) {
      console.log(`   ❌ Recent organizers failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    console.log('\n4. Testing handleGetSalesOverview...');
    try {
      const sales = await adminModule.handleGetSalesOverview();
      console.log(`   ✅ Sales overview:`, JSON.stringify(sales, null, 2));
    } catch (error) {
      console.log(`   ❌ Sales overview failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    console.log('\n5. Testing handleGetPendingEvents...');
    try {
      const pendingEvents = await adminModule.handleGetPendingEvents(5);
      console.log(`   ✅ Pending events count: ${pendingEvents.length}`);
    } catch (error) {
      console.log(`   ❌ Pending events failed: ${error instanceof Error ? error.message : String(error)}`);
    }

  } catch (error) {
    console.error('❌ Business logic test failed:', error instanceof Error ? error.message : String(error));
    console.log('\n🔍 Checking if files exist...');
    
    const fs = await import('fs');
    const path = await import('path');
    
    const files = [
      'src/server/api/admin.ts',
      'src/server/services/dashboard.service.ts'
    ];
    
    files.forEach(file => {
      const fullPath = path.join(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        console.log(`   ✅ ${file} exists`);
      } else {
        console.log(`   ❌ ${file} missing`);
      }
    });
  }
}

testAdminBusinessLogic();
