# Test Payment System Guide

This guide explains how to use the test payment system that has been implemented to disable Xendit and allow testing transactions without actual money exchange.

## Overview

The system now supports two modes:
1. **Production Mode**: Uses Xendit payment gateway for real transactions
2. **Test Mode**: Uses mock payment system for testing without real money

## Configuration

### Environment Variables

Add the following to your `.env` file:

```bash
# Payment Gateway Control
# Set to "true" to enable Xendit, leave empty or "false" for test mode
NEXT_PUBLIC_XENDIT_ENABLED=""

# For test mode, you can leave Xendit credentials empty
XENDIT_SECRET_KEY=""
XENDIT_WEBHOOK_TOKEN=""
```

### Enabling Test Mode

To enable test mode (disable Xendit):
- Set `NEXT_PUBLIC_XENDIT_ENABLED=""` (empty) or `NEXT_PUBLIC_XENDIT_ENABLED="false"`
- Leave `XENDIT_SECRET_KEY` empty

To enable production mode (enable Xendit):
- Set `NEXT_PUBLIC_XENDIT_ENABLED="true"`
- Provide valid `XENDIT_SECRET_KEY` and `XENDIT_WEBHOOK_TOKEN`

## Test Mode Features

### Payment Methods

In test mode, the following payment methods are available:
- **Test Bank Transfer**: Simulates bank transfer payments
- **Test E-Wallet**: Simulates e-wallet payments (OVO, DANA, GoPay)
- **Test Cash Payment**: Simulates cash payments

### Payment Flow

1. **Order Creation**: Same as production mode
2. **Payment Method Selection**: Shows test payment methods with clear "MODE TEST" indicators
3. **Test Payment Page**: Shows payment instructions and simulation buttons
4. **Payment Completion**: User can simulate successful or failed payments
5. **Order Completion**: Order status is updated based on simulation choice

### Test Payment Instructions

When a user selects a test payment method, they will see:
- Clear indication that this is a test transaction
- Mock payment instructions (bank details, amounts, etc.)
- Two buttons:
  - "Simulasi Pembayaran Berhasil" (Simulate Successful Payment)
  - "Simulasi Pembayaran Gagal" (Simulate Failed Payment)

## API Endpoints

### Test Payment Completion

**POST** `/api/public/test-payment`

Completes a test payment simulation.

**Request Body:**
```json
{
  "paymentId": "mock_payment_123",
  "orderId": "order_456",
  "success": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_456",
      "status": "SUCCESS",
      "invoiceNumber": "INV-123"
    },
    "payment": {
      "id": "payment_789",
      "status": "SUCCESS"
    }
  },
  "message": "Test payment completed successfully!"
}
```

## Database Changes

The system uses the existing database schema with the following considerations:
- `Payment.gateway` field stores "MOCK" for test payments vs "XENDIT" for real payments
- `Payment.callbackPayload` stores test payment data for mock transactions
- Order and ticket creation flow remains the same

## User Experience

### Visual Indicators

- **Payment Method Selector**: Shows "MODE TEST" badge when in test mode
- **Test Payment Page**: Clear warnings about test transactions
- **Success Page**: Indicates if transaction was a test

### Test Mode Benefits

1. **No Real Money**: No actual payments are processed
2. **Full Flow Testing**: Complete order-to-completion flow can be tested
3. **Error Simulation**: Can test both success and failure scenarios
4. **Quick Testing**: Instant payment completion without waiting for real payment processing

## Development Workflow

### For Testing

1. Set `NEXT_PUBLIC_XENDIT_ENABLED=""` in your `.env`
2. Start the application
3. Create an event as an organizer
4. Purchase tickets as a buyer
5. Use test payment methods to complete the transaction
6. Verify order completion and ticket generation

### For Production

1. Set `NEXT_PUBLIC_XENDIT_ENABLED="true"` in your `.env`
2. Provide valid Xendit credentials
3. Test with real Xendit sandbox/production environment

## Security Considerations

- Test payment endpoints require authentication
- Test payments are clearly marked in the database
- Production mode validation ensures real payments aren't accidentally processed as test payments

## Troubleshooting

### Common Issues

1. **Payment methods not showing**: Check `NEXT_PUBLIC_XENDIT_ENABLED` environment variable
2. **Test payment not completing**: Verify authentication and API endpoint accessibility
3. **Mode not switching**: Restart the application after changing environment variables

### Logs

Test payment activities are logged with clear indicators:
- `Error creating Mock payment:` for test payment errors
- `Error creating Xendit payment:` for real payment errors

## Future Enhancements

Potential improvements for the test payment system:
1. Admin panel to view test vs real transactions
2. Test payment analytics and reporting
3. More sophisticated test payment scenarios
4. Integration with automated testing frameworks
