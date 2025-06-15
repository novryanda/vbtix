# Email Configuration Setup Guide for VBTicket

This guide provides complete instructions for setting up email functionality in the VBTicket application, including automatic QR code ticket delivery after payment.

## Overview

The VBTicket application uses **Resend** as the primary email service provider for:
- Automatic ticket delivery with QR codes after payment verification
- Account verification emails
- Payment confirmation notifications
- Real-time email notifications for organizers and admins

## Required Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Email Configuration (Required)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="noreply@yourdomain.com"

# Optional Email Configuration
EMAIL_SERVER_HOST=""
EMAIL_SERVER_PORT=""
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""

# QR Code Encryption (Required for QR codes)
QR_CODE_ENCRYPTION_KEY="your-32-character-encryption-key-here"
```

## Resend API Setup

### 1. Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Domain Setup

1. **Add Your Domain:**
   - Go to Domains in your Resend dashboard
   - Click "Add Domain"
   - Enter your domain (e.g., `yourdomain.com`)
   - Follow DNS verification steps

2. **DNS Records:**
   Add these DNS records to your domain:
   ```
   Type: TXT
   Name: @
   Value: resend-verification=xxxxxxxxxxxxx

   Type: MX
   Name: @
   Value: feedback-smtp.resend.com
   Priority: 10
   ```

3. **Verify Domain:**
   - Wait for DNS propagation (up to 24 hours)
   - Click "Verify" in Resend dashboard

### 3. Get API Key

1. Go to API Keys in your Resend dashboard
2. Click "Create API Key"
3. Choose "Sending access" for production
4. Copy the API key (starts with `re_`)

### 4. Configure Environment Variables

```bash
# Replace with your actual API key
RESEND_API_KEY="re_your_actual_api_key_here"

# Use your verified domain
EMAIL_FROM="noreply@yourdomain.com"

# Generate a 32-character encryption key for QR codes
QR_CODE_ENCRYPTION_KEY="abcdefghijklmnopqrstuvwxyz123456"
```

## Email Templates

The application includes pre-built email templates:

### 1. Ticket Delivery Template
- **File:** `src/lib/email-service.ts`
- **Features:** QR codes, event details, ticket information
- **Triggered:** After payment verification and QR code generation

### 2. Account Verification Template
- **File:** `src/lib/email-service.ts`
- **Features:** Verification link, user-friendly design
- **Triggered:** During user registration

## Testing Email Configuration

### 1. Test API Endpoint

Use the built-in test endpoint to verify email configuration:

```bash
# Test ticket delivery email
curl -X POST http://localhost:3000/api/test/email-templates \
  -H "Content-Type: application/json" \
  -d '{
    "type": "ticket",
    "email": "test@example.com"
  }'

# Test verification email
curl -X POST http://localhost:3000/api/test/email-templates \
  -H "Content-Type: application/json" \
  -d '{
    "type": "verification",
    "email": "test@example.com"
  }'
```

### 2. Check Email Service Status

The application will log email status:

```bash
# Success logs
✅ Email sent: [message-id]
✅ Ticket delivery email sent to user@example.com for order INV-123

# Error logs
❌ Failed to send email: [error-message]
📧 Email service not configured. Ticket email would be sent to: user@example.com
```

## Production Deployment

### 1. Environment Variables

Ensure all required environment variables are set in your production environment:

```bash
# Vercel
vercel env add RESEND_API_KEY
vercel env add EMAIL_FROM
vercel env add QR_CODE_ENCRYPTION_KEY

# Railway
railway variables set RESEND_API_KEY=re_your_key
railway variables set EMAIL_FROM=noreply@yourdomain.com
railway variables set QR_CODE_ENCRYPTION_KEY=your_32_char_key

# Docker
docker run -e RESEND_API_KEY=re_your_key \
           -e EMAIL_FROM=noreply@yourdomain.com \
           -e QR_CODE_ENCRYPTION_KEY=your_32_char_key \
           your-app
```

### 2. Domain Verification

Ensure your domain is verified in Resend before deploying to production.

### 3. Rate Limits

Resend free tier includes:
- 3,000 emails/month
- 100 emails/day

For higher volumes, upgrade to a paid plan.

## Troubleshooting

### Common Issues

1. **"Email service not configured" message:**
   - Check `RESEND_API_KEY` is set correctly
   - Verify API key format (starts with `re_`)

2. **Emails not being sent:**
   - Verify domain is confirmed in Resend
   - Check `EMAIL_FROM` uses verified domain
   - Review application logs for error messages

3. **QR codes not appearing in emails:**
   - Ensure `QR_CODE_ENCRYPTION_KEY` is set
   - Check QR code generation is successful
   - Verify ticket status is "SUCCESS"

4. **DNS verification failing:**
   - Wait up to 24 hours for DNS propagation
   - Use DNS checker tools to verify records
   - Contact your DNS provider if issues persist

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
```

This will show detailed email service logs in the console.

## Security Considerations

1. **API Key Security:**
   - Never commit API keys to version control
   - Use environment variables in all environments
   - Rotate API keys regularly

2. **Email Content:**
   - QR codes are encrypted before embedding
   - Personal information is handled securely
   - Email templates escape user input

3. **Rate Limiting:**
   - Application includes built-in rate limiting
   - Monitor email sending patterns
   - Implement additional rate limiting if needed

## Support

For additional help:

1. **Resend Documentation:** [resend.com/docs](https://resend.com/docs)
2. **VBTicket Issues:** Create an issue in the project repository
3. **Email Template Customization:** Modify templates in `src/lib/email-service.ts`

## Email Flow Summary

1. **Payment Received** → QR codes generated → Email sent automatically
2. **Manual Payment Approved** → QR codes generated → Email sent automatically  
3. **Real-time Updates** → Buyer dashboard updates automatically
4. **Email Delivery** → Includes QR codes, event details, and instructions

The email system is now fully integrated with the payment flow and provides automatic ticket delivery with QR codes.
