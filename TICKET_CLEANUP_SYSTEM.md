# Ticket Cleanup System

## Overview

The VBTix Ticket Cleanup System is designed to maintain accurate ticket sales statistics by removing PENDING tickets that haven't been approved by admin yet. This ensures that only admin-approved tickets (ACTIVE/USED status) are counted as sold in dashboard statistics and inventory calculations.

## Problem Statement

In the VBTix system, tickets go through the following lifecycle:
1. **PENDING** - Created during purchase, awaiting admin approval
2. **ACTIVE** - Admin-approved, counted as sold
3. **USED** - Scanned/checked-in at event

Without cleanup, PENDING tickets accumulate in the database and can:
- Skew inventory calculations
- Create confusion in sales statistics
- Consume unnecessary database storage
- Impact system performance over time

## Solution Architecture

The cleanup system follows VBTix's 3-tier architecture:

### 1. Service Layer (`TicketCleanupService`)
- **Location**: `src/server/services/ticket-cleanup.service.ts`
- **Purpose**: Core business logic for ticket cleanup operations
- **Features**:
  - Statistics gathering
  - Safe ticket deletion with transaction support
  - Comprehensive logging
  - Orphaned transaction cleanup
  - Configurable cleanup criteria

### 2. API Layer (Cron Endpoint)
- **Location**: `src/app/api/cron/cleanup-pending-tickets/route.ts`
- **Purpose**: HTTP endpoint for scheduled cleanup
- **Features**:
  - GET/POST endpoints for automated/manual cleanup
  - Query parameter configuration
  - Authentication via CRON_SECRET
  - Comprehensive response data

### 3. Script Layer (Standalone Script)
- **Location**: `scripts/cleanup-pending-tickets.js`
- **Purpose**: Command-line tool for manual cleanup
- **Features**:
  - Interactive and automated modes
  - Dry-run capability
  - Statistics-only mode
  - User-friendly output and confirmations

## Key Features

### 🔒 Safety Features
- **Transaction-based operations** ensure data integrity
- **Dry-run mode** for safe testing
- **Comprehensive logging** for audit trail
- **Batch processing** to avoid memory issues
- **Referential integrity** preservation
- **User confirmation** in interactive mode

### 📊 Cleanup Criteria
- **Age-based**: Remove tickets older than specified hours (default: 24h)
- **Payment status**: Include failed/expired payment tickets
- **Status-based**: Only targets PENDING tickets
- **Batch size**: Configurable batch processing (default: 100)

### 🔍 Statistics & Monitoring
- **Real-time statistics** before cleanup
- **Detailed breakdown** by age and payment status
- **Execution metrics** (time, affected records)
- **Comprehensive logging** to database Log table

## Usage

### 1. Command Line Script

#### Basic Usage
```bash
# Interactive mode with statistics
npm run db:cleanup

# Show statistics only
npm run db:cleanup -- --stats

# Dry run (preview without deletion)
npm run db:cleanup -- --dry-run

# Automated cleanup (no prompts)
npm run db:cleanup -- --auto --max-age=48
```

#### Advanced Options
```bash
# Cleanup tickets older than 48 hours, including failed payments
npm run db:cleanup -- --auto --max-age=48 --include-failed

# Large batch processing
npm run db:cleanup -- --auto --batch-size=500

# Help
npm run db:cleanup -- --help
```

### 2. Cron Endpoint

#### Automated Cleanup (GET)
```bash
# Basic cleanup
curl "https://your-domain.com/api/cron/cleanup-pending-tickets"

# With authentication
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
     "https://your-domain.com/api/cron/cleanup-pending-tickets?maxAge=24&includeFailedPayments=true"

# Dry run
curl "https://your-domain.com/api/cron/cleanup-pending-tickets?dryRun=true"
```

#### Manual Cleanup (POST)
```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_CRON_SECRET" \
     -d '{"maxAge": 48, "includeFailedPayments": true, "dryRun": false}' \
     "https://your-domain.com/api/cron/cleanup-pending-tickets"
```

### 3. Programmatic Usage

```typescript
import { TicketCleanupService } from "~/server/services/ticket-cleanup.service";

// Get statistics
const stats = await TicketCleanupService.getCleanupStats({
  maxAge: 24,
  includeFailedPayments: true,
});

// Perform cleanup
const result = await TicketCleanupService.cleanupPendingTickets({
  dryRun: false,
  maxAge: 24,
  batchSize: 100,
  includeFailedPayments: true,
});

// Clean orphaned transactions
const orphanResult = await TicketCleanupService.cleanupOrphanedTransactions(false);
```

## Configuration

### Environment Variables
```env
# Optional: Secure cron endpoints
CRON_SECRET=your-secret-key-here

# Database connection (required)
DATABASE_URL=your-database-url
```

### Default Settings
- **Max Age**: 24 hours
- **Batch Size**: 100 records
- **Include Failed Payments**: true
- **Dry Run**: false

## Scheduling

### Recommended Schedule
- **Daily cleanup**: Remove tickets older than 24 hours
- **Weekly deep cleanup**: Remove tickets older than 7 days with failed payments
- **Monthly maintenance**: Full statistics review

### Vercel Cron (vercel.json)
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-pending-tickets?maxAge=24&includeFailedPayments=true",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### GitHub Actions
```yaml
name: Daily Ticket Cleanup
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Cleanup PENDING Tickets
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            "${{ secrets.APP_URL }}/api/cron/cleanup-pending-tickets?maxAge=24"
```

## Monitoring & Logging

### Database Logs
All cleanup operations are logged to the `Log` table with:
- **Action**: TICKET_CLEANUP_START, TICKET_DELETED, TICKET_CLEANUP_COMPLETE
- **Entity**: Ticket
- **Metadata**: Detailed operation information
- **Timestamp**: Automatic timestamping

### Console Logs
Structured console logging with:
- 🧹 Cleanup operations
- 📊 Statistics and metrics
- ✅ Success indicators
- ❌ Error messages
- ⏱️ Performance metrics

### Example Log Output
```
🧹 Starting ticket cleanup...
📊 Options: maxAge=24h, batchSize=100, includeFailedPayments=true
🎫 Found 45 tickets eligible for cleanup
✅ Cleanup completed successfully
🗑️ Deleted 45 PENDING tickets
📊 Affected 23 transactions and 8 ticket types
⏱️ Execution time: 1.2s
```

## Impact on System

### Positive Effects
- ✅ **Accurate statistics**: Only approved tickets count as sold
- ✅ **Better performance**: Reduced database size
- ✅ **Clean inventory**: Accurate availability calculations
- ✅ **Audit compliance**: Comprehensive logging
- ✅ **Data integrity**: Transaction-based operations

### What's Preserved
- ✅ **ACTIVE tickets**: Admin-approved tickets remain untouched
- ✅ **USED tickets**: Scanned tickets remain untouched
- ✅ **Related data**: Orders, payments, and buyer info preserved
- ✅ **Audit trail**: All operations logged
- ✅ **Referential integrity**: Foreign key constraints respected

### What's Removed
- ❌ **PENDING tickets**: Unapproved tickets older than threshold
- ❌ **Failed payment tickets**: Tickets from failed/expired payments
- ❌ **Orphaned transactions**: Transactions with no remaining tickets
- ❌ **Related ticket holders**: Associated ticket holder records

## Error Handling

### Graceful Degradation
- Database connection failures are caught and logged
- Partial failures don't affect completed operations
- Transaction rollback on critical errors
- Detailed error reporting in responses

### Recovery Procedures
1. **Check logs** in database Log table
2. **Review error messages** in console output
3. **Use dry-run mode** to test before actual cleanup
4. **Contact support** if persistent issues occur

## Best Practices

### Before Running Cleanup
1. **Backup database** (recommended for production)
2. **Test with dry-run** mode first
3. **Review statistics** to understand impact
4. **Schedule during low-traffic periods**

### Regular Maintenance
1. **Monitor cleanup logs** for anomalies
2. **Adjust max-age** based on business needs
3. **Review statistics** regularly
4. **Update batch size** for performance optimization

### Security Considerations
1. **Use CRON_SECRET** for production endpoints
2. **Restrict cron endpoint access** via firewall/proxy
3. **Monitor unauthorized access** attempts
4. **Regular security audits** of cleanup operations

## Troubleshooting

### Common Issues

#### "No tickets found for cleanup"
- **Cause**: All tickets are already ACTIVE/USED or within age threshold
- **Solution**: Normal behavior, no action needed

#### "Unauthorized" error on cron endpoint
- **Cause**: Missing or incorrect CRON_SECRET
- **Solution**: Set correct Authorization header

#### "Transaction failed" error
- **Cause**: Database constraint violation or connection issue
- **Solution**: Check database logs, retry with smaller batch size

#### Performance issues
- **Cause**: Large number of tickets to process
- **Solution**: Reduce batch size, increase max-age threshold

### Support
For additional support or questions about the cleanup system:
1. Check the database Log table for detailed operation history
2. Review console logs for error details
3. Use dry-run mode to test configurations
4. Contact the development team with specific error messages
