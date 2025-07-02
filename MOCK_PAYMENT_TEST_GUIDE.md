# Mock Payment System Testing Guide

This guide will walk you through testing the mock payment system with real event tickets.

## 🚀 Quick Start

### Prerequisites
1. Development server is running on `http://localhost:3001`
2. Test mode is enabled (`NEXT_PUBLIC_XENDIT_ENABLED=""` in .env)
3. Test event has been created (run `npx tsx scripts/create-test-event.ts`)

### Test Event Details
- **Event**: Tech Conference 2024 - Test Event
- **URL**: http://localhost:3001/events/tech-conference-2024-test
- **Ticket Types**:
  - Early Bird: IDR 250,000
  - Regular: IDR 350,000  
  - VIP: IDR 750,000

## 📋 Step-by-Step Testing Process

### Step 1: Navigate to Event Page
1. Open: http://localhost:3001/events/tech-conference-2024-test
2. You should see the event details with ticket options
3. Verify that ticket prices and availability are displayed correctly

### Step 2: Select Tickets
1. Choose your desired ticket type(s)
2. Select quantity for each ticket type
3. Click "Beli Tiket" or "Purchase Tickets"
4. You should be redirected to the checkout form

### Step 3: Fill Buyer Information
1. Fill out the "Data Pemesan" (Buyer Information) section:
   - **Nama Lengkap**: Your full name
   - **Jenis Identitas**: KTP/SIM/Passport
   - **Nomor Identitas**: ID number
   - **Email**: Valid email address
   - **Nomor WhatsApp**: Phone number (format: +62xxxxxxxxxx)

### Step 4: Fill Ticket Holder Information
1. For each ticket, you can either:
   - **Option A**: Check "Samakan dengan data pemesan" to auto-copy buyer data
   - **Option B**: Manually fill each ticket holder's information

2. **Testing the Auto-Copy Feature**:
   - Check the "Samakan dengan data pemesan" checkbox
   - Notice how all fields are automatically filled and disabled
   - Uncheck to enable manual editing
   - Check again to see data re-copied

### Step 5: Submit Order
1. Click "Lanjut ke Pembayaran"
2. The system will create an order and redirect to payment selection
3. **Check browser console** for debug logs showing the request/response

### Step 6: Select Test Payment Method
1. You should see **"MODE TEST"** indicators on the payment page
2. Available test payment methods:
   - **Test Bank Transfer**: Simulates bank transfer
   - **Test E-Wallet**: Simulates e-wallet payments
   - **Test Cash Payment**: Simulates cash payments

3. Select a payment method and fill any required details
4. Click "Lanjutkan Pembayaran"

### Step 7: Complete Test Payment
1. You'll be redirected to the test payment page
2. You should see:
   - Clear "MODE TEST" warnings
   - Mock payment instructions
   - Two simulation buttons:
     - **"Simulasi Pembayaran Berhasil"** (Simulate Success)
     - **"Simulasi Pembayaran Gagal"** (Simulate Failure)

3. Click either button to complete the simulation

### Step 8: Verify Results
1. **For Successful Payment**:
   - Redirected to success page
   - Order status updated to "SUCCESS"
   - Tickets generated in the system
   - Clear indication it was a test transaction

2. **For Failed Payment**:
   - Redirected back to checkout with error message
   - Order remains in "PENDING" status

## 🔍 What to Look For

### Visual Indicators
- [ ] "MODE TEST" badges on payment method selector
- [ ] Test payment method names (prefixed with "Test")
- [ ] Warning messages about test transactions
- [ ] Disabled form fields when using "Samakan dengan data pemesan"

### Console Logs
Open browser developer tools and check for:
- [ ] "Sending ticket purchase request:" with form data
- [ ] "Ticket purchase response:" with order details
- [ ] "Sending checkout request:" with payment method
- [ ] "Checkout response:" with payment token and test mode flag

### Database Changes
After successful test payment, verify:
- [ ] Transaction record created with status "SUCCESS"
- [ ] Payment record created with gateway "MOCK"
- [ ] Ticket records created for each purchased ticket
- [ ] TicketHolder records created with buyer/holder information

## 🧪 Test Scenarios

### Scenario 1: Single Ticket Purchase
1. Buy 1 Regular ticket
2. Use buyer data for ticket holder
3. Complete with Manual Payment
4. Verify successful completion

### Scenario 2: Multiple Tickets, Mixed Holders
1. Buy 2 VIP tickets + 1 Regular ticket
2. Use buyer data for first ticket only
3. Manually fill other ticket holders
4. Complete with QRIS By Wonders
5. Verify all ticket holders are correctly saved

### Scenario 3: Payment Failure Simulation
1. Buy any ticket
2. Fill all required information
3. Select any test payment method
4. Click "Simulasi Pembayaran Gagal"
5. Verify error handling and order status

### Scenario 4: Form Validation
1. Try submitting with empty buyer information
2. Try submitting with empty ticket holder information
3. Verify validation messages appear
4. Test WhatsApp number format validation

## 🐛 Troubleshooting

### Common Issues

**Issue**: Payment methods show real Xendit options instead of test methods
- **Solution**: Check `NEXT_PUBLIC_XENDIT_ENABLED=""` in .env file
- **Solution**: Restart the development server after changing environment variables
- **Expected**: Should show "Manual Payment" and "QRIS By Wonders" options only

**Issue**: "Validation error" when submitting order
- **Solution**: Check browser console for detailed validation errors
- **Solution**: Ensure WhatsApp number format is correct (+62xxxxxxxxxx)
- **Solution**: Verify all required fields are filled

**Issue**: Test payment page not loading
- **Solution**: Check if order was created successfully
- **Solution**: Verify the checkout API response includes `isTestMode: true`

**Issue**: Auto-copy checkbox not working
- **Solution**: Fill buyer information first before checking the box
- **Solution**: Check browser console for any JavaScript errors

### Debug Information

Enable detailed logging by checking browser console for:
- Request/response data for ticket purchase API
- Request/response data for checkout API  
- Payment method selection details
- Test payment completion results

## ✅ Success Criteria

A successful test should demonstrate:
1. **Complete Flow**: From event page to payment completion
2. **Test Mode Active**: Clear visual indicators throughout
3. **Data Integrity**: All form data correctly saved to database
4. **Payment Simulation**: Both success and failure scenarios work
5. **User Experience**: Smooth flow with appropriate feedback messages

## 🔄 Switching to Production Mode

To test with real Xendit payments:
1. Set `NEXT_PUBLIC_XENDIT_ENABLED="true"` in .env
2. Provide valid `XENDIT_SECRET_KEY` and `XENDIT_WEBHOOK_TOKEN`
3. Restart the development server
4. Payment methods will switch to real Xendit options

## 📞 Support

If you encounter issues during testing:
1. Check the browser console for error messages
2. Review the server logs in the terminal
3. Verify environment variables are set correctly
4. Ensure the database is accessible and up to date
