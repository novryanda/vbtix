# VBTicket Real-time Updates & Email Delivery Troubleshooting Guide

This guide helps you debug and fix issues with real-time status updates and email delivery in the VBTicket application.

## 🚨 Issue 1: Real-time Status Updates - 400 Errors

### Problem
The buyer dashboard pages show repeated 400 errors when polling for order status:
```
GET /api/public/orders/[orderId]/status 400 in 68ms
```

### Root Causes & Solutions

#### 1. **Next.js 15 Params Handling Issue** ✅ FIXED
**Problem:** Next.js 15 changed how route parameters are handled - they're now async.

**Solution:** Updated the status endpoint to await params:
```typescript
// Before (causing 400 errors)
{ params }: { params: { orderId: string } }

// After (fixed)
{ params }: { params: Promise<{ orderId: string }> }
const resolvedParams = await params;
```

#### 2. **Database Schema Mismatch for Guest Access** ✅ FIXED
**Problem:** Code was trying to filter by `sessionId` on Transaction table, but this field doesn't exist.

**Solution:** Updated status endpoint to use the same guest user logic as existing order endpoint:
```typescript
// For guest users, find orders by user phone pattern
if (sessionId) {
  whereClause.user = {
    phone: `guest_${sessionId}`, // Guest users have phone set to guest_sessionId
  };
}

// Use findFirst instead of findUnique to support user relation filtering
const order = await prisma.transaction.findFirst({
  where: whereClause,
  // ... include user relation in select
});
```

### Testing the Fix

1. **Test the status endpoint fix:**
```bash
curl -X POST http://localhost:3000/api/test/status-endpoint-fix \
  -H "Content-Type: application/json" \
  -d '{"orderId": "cmbxgyo6m0004uoz0ocvtehpm"}'
```

2. **Test the debug endpoint:**
```bash
curl -X POST http://localhost:3000/api/debug/realtime-email \
  -H "Content-Type: application/json" \
  -d '{"orderId": "cmbxgyo6m0004uoz0ocvtehpm", "action": "test-status"}'
```

3. **Check browser console:** Should see successful status updates instead of 400/500 errors.

4. **Verify real-time updates:** Status should update automatically when payment is verified.

---

## 📧 Issue 2: Email Delivery Not Working

### Problem
Emails with QR code tickets are not being delivered after payment verification.

### Debugging Steps

#### Step 1: Check Environment Variables
```bash
# Required variables
RESEND_API_KEY="re_your_api_key_here"
EMAIL_FROM="noreply@yourdomain.com"
QR_CODE_ENCRYPTION_KEY="your-32-character-key"
```

**Test:**
```bash
curl -X POST http://localhost:3000/api/debug/realtime-email \
  -H "Content-Type: application/json" \
  -d '{"orderId": "your-order-id", "action": "test-all"}'
```

#### Step 2: Verify QR Code Generation
**Problem:** Emails won't send if QR codes aren't generated.

**Check QR codes:**
```bash
curl -X POST http://localhost:3000/api/debug/realtime-email \
  -H "Content-Type: application/json" \
  -d '{"orderId": "your-order-id", "action": "generate-qr"}'
```

**Expected response:**
```json
{
  "tests": {
    "qrGeneration": {
      "success": true,
      "data": {
        "generatedCount": 2,
        "errors": []
      }
    }
  }
}
```

#### Step 3: Test Email Configuration
```bash
curl -X POST http://localhost:3000/api/debug/realtime-email \
  -H "Content-Type: application/json" \
  -d '{"orderId": "your-order-id", "action": "test-email"}'
```

#### Step 4: Send Test Email
```bash
curl -X POST http://localhost:3000/api/debug/realtime-email \
  -H "Content-Type: application/json" \
  -d '{"orderId": "your-order-id", "action": "send-email"}'
```

### Common Email Issues & Solutions

#### 1. **Resend API Key Not Set**
**Error:** `❌ Failed to send email: API key is required`

**Solution:**
```bash
# Add to .env
RESEND_API_KEY="re_your_actual_api_key"
```

#### 2. **Domain Not Verified**
**Error:** `❌ Failed to send email: Domain not verified`

**Solution:**
1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add your domain
3. Add DNS records
4. Wait for verification

#### 3. **Invalid FROM Address**
**Error:** `❌ Failed to send email: Invalid from address`

**Solution:**
```bash
# Use verified domain
EMAIL_FROM="noreply@your-verified-domain.com"
```

#### 4. **QR Codes Not Generated**
**Error:** Email sends but without QR codes

**Solution:**
```bash
# Check QR code encryption key
QR_CODE_ENCRYPTION_KEY="your-32-character-encryption-key"

# Regenerate QR codes
curl -X POST http://localhost:3000/api/debug/realtime-email \
  -H "Content-Type: application/json" \
  -d '{"orderId": "your-order-id", "action": "generate-qr"}'
```

---

## 🔧 Complete Debugging Workflow

### Step 1: Run Complete Debug
```bash
curl -X POST http://localhost:3000/api/debug/realtime-email \
  -H "Content-Type: application/json" \
  -d '{"orderId": "cmbxgyo6m0004uoz0ocvtehpm", "action": "test-all"}'
```

### Step 2: Check Debug Results
Look for these key indicators:

```json
{
  "tests": {
    "orderExists": { "success": true },
    "environmentVariables": { "success": true },
    "qrCodes": { "success": true },
    "emailConfig": { "success": true },
    "statusEndpoint": { "success": true }
  },
  "summary": {
    "allPassed": true,
    "recommendations": []
  }
}
```

### Step 3: Fix Issues Based on Results

**If `orderExists` fails:**
- Check if order ID is correct
- Verify order exists in database

**If `environmentVariables` fails:**
- Set missing environment variables
- Restart application

**If `qrCodes` fails:**
- Run QR code generation
- Check encryption key

**If `emailConfig` fails:**
- Verify Resend API key
- Check domain verification
- Test email address

**If `statusEndpoint` fails:**
- Check database connection
- Verify order permissions

---

## 🚀 Production Deployment Checklist

### Before Deploying
- [ ] Set all required environment variables
- [ ] Verify Resend domain
- [ ] Test email delivery in staging
- [ ] Test real-time updates
- [ ] Run debug endpoint tests

### Environment Variables
```bash
# Production
RESEND_API_KEY=re_production_key
EMAIL_FROM=noreply@yourdomain.com
QR_CODE_ENCRYPTION_KEY=your_secure_32_char_key
NEXTAUTH_SECRET=your_nextauth_secret
DATABASE_URL=your_production_db_url
```

### Monitoring
Watch for these log messages:

**Success:**
```
✅ Ticket delivery email sent for order ORDER_ID
✅ QR code generation result: 2 generated, errors: []
🔄 Order status updated: PENDING → SUCCESS
```

**Errors:**
```
❌ Failed to send email: [error-message]
❌ Error generating QR codes: [error-message]
❌ Failed to fetch order status: [error-message]
```

---

## 🆘 Quick Fixes

### Real-time Updates Not Working
1. Check browser console for 400/401 errors
2. Verify sessionId in localStorage
3. Test status endpoint manually
4. Check authentication

### Emails Not Sending
1. Verify RESEND_API_KEY is set
2. Check domain verification
3. Test with debug endpoint
4. Generate QR codes first

### QR Codes Missing
1. Check QR_CODE_ENCRYPTION_KEY
2. Run QR generation manually
3. Verify ticket status is SUCCESS

### Performance Issues
1. Reduce polling frequency
2. Stop polling for completed orders
3. Use WebSocket for real-time updates (future enhancement)

---

## 📞 Support

If issues persist after following this guide:

1. **Check logs:** Look for specific error messages
2. **Run debug endpoint:** Get detailed diagnostic information
3. **Test individual components:** QR generation, email sending, status updates
4. **Verify environment:** Ensure all required variables are set

The debug endpoint at `/api/debug/realtime-email` provides comprehensive testing and should identify the root cause of most issues.
