# 🚀 Vercel Deployment Fix Guide

## Problem
App works locally with `npm run dev` but fails on Vercel deployment.

## Root Causes & Solutions

### 1. **Environment Variables Missing**

**In Vercel Dashboard → Settings → Environment Variables, add:**

```bash
# CRITICAL - These MUST be set
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-app.vercel.app
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres

# OAuth (Required for login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional (but recommended)
RESEND_API_KEY=your-resend-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
MIDTRANS_SERVER_KEY=your-midtrans-key
XENDIT_SECRET_KEY=your-xendit-key

# Build optimization
SKIP_ENV_VALIDATION=true
```

### 2. **Get Correct Supabase URLs**

1. Go to **Supabase Dashboard** → **Settings** → **Database**
2. Copy these URLs:

**DATABASE_URL (Connection Pooling):**
```
postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

**DIRECT_URL (Direct Connection):**
```
postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
```

### 3. **Generate NEXTAUTH_SECRET**

Run this command locally:
```bash
npx auth secret
```

Copy the output to Vercel environment variables.

### 4. **Update Google OAuth Settings**

In Google Cloud Console:
1. Go to **APIs & Services** → **Credentials**
2. Edit your OAuth 2.0 Client
3. Add to **Authorized redirect URIs**:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```

### 5. **Deployment Steps**

1. **Set Environment Variables** in Vercel Dashboard
2. **Redeploy** your app (important!)
3. **Test Database Connection**: Visit `/debug` page
4. **Check Function Logs** in Vercel Dashboard

### 6. **Troubleshooting Commands**

**Test locally with production build:**
```bash
npm run build
npm run start
```

**Check environment variables:**
```bash
# Visit after deployment
https://your-app.vercel.app/api/test-db
```

**View Vercel logs:**
```bash
npx vercel logs your-app-url
```

### 7. **Common Error Messages & Fixes**

| Error | Fix |
|-------|-----|
| "Environment variable not found" | Set all required env vars in Vercel |
| "Prisma client not generated" | Redeploy after setting env vars |
| "Database connection failed" | Check Supabase URLs and credentials |
| "NextAuth configuration error" | Set NEXTAUTH_SECRET and NEXTAUTH_URL |
| "Build failed" | Check build logs for specific errors |

### 8. **Verification Checklist**

- [ ] All environment variables set in Vercel
- [ ] Supabase project is active (not paused)
- [ ] Google OAuth redirect URIs updated
- [ ] App redeployed after env var changes
- [ ] `/debug` page shows successful database connection
- [ ] Login flow works end-to-end

### 9. **Emergency Debugging**

If still not working:

1. **Check Vercel Function Logs**:
   - Vercel Dashboard → Functions → View Logs
   - Look for specific error messages

2. **Test Individual Components**:
   - `/api/test-db` - Database connection
   - `/api/auth/session` - NextAuth setup
   - `/debug` - Overall health check

3. **Compare Local vs Production**:
   - Environment variables
   - Build output
   - Network requests in browser dev tools

This should resolve your Vercel deployment issues!
