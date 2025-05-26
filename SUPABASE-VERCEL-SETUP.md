# Supabase + Vercel Deployment Fix

## Problem
Your app is not making database connections when deployed to Vercel, even though it works locally.

## Root Cause
Missing or incorrect environment variables in Vercel deployment.

## Solution

### 1. Get Correct Supabase URLs

In your Supabase dashboard:

1. Go to **Settings** → **Database**
2. Copy these connection strings:

**For DATABASE_URL (Connection Pooling):**
```
postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

**For DIRECT_URL (Direct Connection):**
```
postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
```

### 2. Update Vercel Environment Variables

In your Vercel dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Add/Update these variables:

```bash
# Database
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres

# NextAuth (CRITICAL!)
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-app.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Other services (if used)
RESEND_API_KEY=your-resend-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
MIDTRANS_SERVER_KEY=your-midtrans-key
XENDIT_SECRET_KEY=your-xendit-key
```

### 3. Verify Prisma Configuration

Your `prisma/schema.prisma` looks correct:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### 4. Test Database Connection

Add this API route to test the connection:

```typescript
// src/app/api/test-db/route.ts
import { prisma } from "~/server/db";

export async function GET() {
  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    return Response.json({ 
      success: true, 
      userCount,
      message: "Database connected successfully" 
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
```

### 5. Common Issues & Fixes

**Issue: "Environment variable not found"**
- Make sure all env vars are set in Vercel
- Redeploy after adding env vars

**Issue: "Connection timeout"**
- Use connection pooling URL for DATABASE_URL
- Check Supabase project is not paused

**Issue: "SSL connection error"**
- Add `?sslmode=require` to connection string if needed

**Issue: "Authentication failed"**
- Double-check password in connection string
- Ensure database password is URL-encoded

### 6. Deployment Checklist

- [ ] Environment variables set in Vercel
- [ ] Database URLs are correct (pooling vs direct)
- [ ] NEXTAUTH_SECRET is set
- [ ] NEXTAUTH_URL matches your domain
- [ ] Prisma client is generated (`postinstall` script)
- [ ] Database is accessible from Vercel's region

### 7. Debug Steps

1. Check Vercel function logs for database errors
2. Test `/api/test-db` endpoint after deployment
3. Verify environment variables in Vercel dashboard
4. Check Supabase logs for connection attempts

This should resolve your database connection issues on Vercel!
