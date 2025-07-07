#!/bin/bash

# Test runner for manual ticket integration
echo "🚀 Running Manual Ticket Integration Test"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if the test file exists
if [ ! -f "dev/test-manual-ticket-integration.ts" ]; then
    echo "❌ Error: Test file not found at dev/test-manual-ticket-integration.ts"
    exit 1
fi

# Run the test using tsx (TypeScript execution)
echo "🔄 Executing test..."
echo ""

npx tsx dev/test-manual-ticket-integration.ts

# Capture the exit code
TEST_EXIT_CODE=$?

echo ""
echo "=========================================="

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ Manual ticket integration test PASSED!"
    echo "🎉 All functionality is working correctly:"
    echo "   - Manual tickets are created with ACTIVE status"
    echo "   - Sold count is incremented immediately"
    echo "   - Dashboard statistics are updated"
    echo "   - QR codes can be generated"
else
    echo "❌ Manual ticket integration test FAILED!"
    echo "🔧 Please check the implementation and try again"
fi

exit $TEST_EXIT_CODE
