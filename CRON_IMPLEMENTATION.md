# 🕐 Cron Implementation untuk VBTix Database Cleanup

## ✅ Status Implementasi

**CRON ENDPOINT SUDAH DIIMPLEMENTASIKAN DAN BERFUNGSI!**

### 🎯 Endpoint yang Tersedia

#### 1. GET `/api/cron/cleanup-pending-tickets`
- **Fungsi**: Cleanup otomatis via cron job
- **Method**: GET
- **Parameters**: Query string
- **Authentication**: Optional CRON_SECRET

#### 2. POST `/api/cron/cleanup-pending-tickets`
- **Fungsi**: Manual cleanup atau testing
- **Method**: POST
- **Parameters**: JSON body
- **Authentication**: Optional CRON_SECRET

### 📊 Test Results

```bash
✅ GET dry-run: Success (0 PENDING tickets, 0 eligible)
✅ POST statistics: Success (0 PENDING tickets, 0 eligible)  
✅ POST dry-run cleanup: Success (0 PENDING tickets, 0 eligible)
```

## 🔧 Konfigurasi Cron Jobs

### 1. **Linux/Unix Crontab**

```bash
# Edit crontab
crontab -e

# Cleanup harian pada jam 2 pagi
0 2 * * * curl -X GET "https://your-domain.com/api/cron/cleanup-pending-tickets?maxAge=24&includeFailedPayments=true"

# Cleanup mingguan pada hari Minggu jam 3 pagi (hapus semua PENDING)
0 3 * * 0 curl -X GET "https://your-domain.com/api/cron/cleanup-pending-tickets?maxAge=1&includeFailedPayments=true"
```

### 2. **Vercel Cron Jobs**

Buat file `vercel.json`:

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

### 3. **GitHub Actions**

Buat file `.github/workflows/cleanup-cron.yml`:

```yaml
name: Database Cleanup
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:     # Manual trigger

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Cleanup PENDING Tickets
        run: |
          curl -X GET "${{ secrets.APP_URL }}/api/cron/cleanup-pending-tickets?maxAge=24&includeFailedPayments=true" \
               -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### 4. **Railway Cron**

```bash
# Railway cron job
railway run curl -X GET "https://your-app.railway.app/api/cron/cleanup-pending-tickets?maxAge=24&includeFailedPayments=true"
```

### 5. **Netlify Functions**

Buat file `netlify/functions/cleanup-cron.js`:

```javascript
exports.handler = async (event, context) => {
  const response = await fetch(`${process.env.APP_URL}/api/cron/cleanup-pending-tickets?maxAge=24&includeFailedPayments=true`, {
    headers: {
      'Authorization': `Bearer ${process.env.CRON_SECRET}`
    }
  });
  
  return {
    statusCode: 200,
    body: JSON.stringify(await response.json())
  };
};
```

## 🔐 Security Configuration

### Environment Variables

```bash
# .env.local
CRON_SECRET=your-super-secret-cron-key-here
```

### Dengan Authentication

```bash
# Dengan CRON_SECRET
curl -X GET "https://your-domain.com/api/cron/cleanup-pending-tickets?maxAge=24" \
     -H "Authorization: Bearer your-super-secret-cron-key-here"

# Tanpa authentication (jika CRON_SECRET tidak diset)
curl -X GET "https://your-domain.com/api/cron/cleanup-pending-tickets?maxAge=24"
```

## 📋 Parameter Options

### GET Parameters (Query String)
- `maxAge`: Maximum age in hours (default: 24)
- `batchSize`: Batch size for processing (default: 100)
- `includeFailedPayments`: Include failed/expired payments (default: true)
- `dryRun`: Preview mode without deletion (default: false)

### POST Parameters (JSON Body)
```json
{
  "maxAge": 24,
  "batchSize": 100,
  "includeFailedPayments": true,
  "dryRun": false,
  "statsOnly": false
}
```

## 🧪 Testing Commands

```bash
# Test endpoint lokal
npm run test:cron-simple

# Manual test dengan curl
curl -X GET "http://localhost:3001/api/cron/cleanup-pending-tickets?dryRun=true&maxAge=24"

# Test dengan POST
curl -X POST "http://localhost:3001/api/cron/cleanup-pending-tickets" \
     -H "Content-Type: application/json" \
     -d '{"statsOnly":true}'
```

## 📊 Response Format

```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalPendingTickets": 0,
      "eligibleForDeletion": 0,
      "ticketsByAge": {
        "under1Hour": 0,
        "under24Hours": 0,
        "under7Days": 0,
        "over7Days": 0
      },
      "ticketsByPaymentStatus": {
        "pending": 0,
        "failed": 0,
        "expired": 0
      }
    },
    "cleanup": {
      "success": true,
      "deletedTickets": 0,
      "affectedTransactions": 0,
      "affectedTicketTypes": [],
      "executionTimeMs": 1421
    },
    "executionTimeMs": 1421,
    "parameters": {
      "maxAge": 24,
      "batchSize": 100,
      "includeFailedPayments": true,
      "dryRun": false
    }
  },
  "message": "No cleanup needed",
  "timestamp": "2025-07-02T02:01:50.123Z"
}
```

## 🚀 Deployment Checklist

- [x] ✅ Cron endpoint implemented
- [x] ✅ Authentication support (CRON_SECRET)
- [x] ✅ GET and POST methods
- [x] ✅ Comprehensive error handling
- [x] ✅ Detailed logging
- [x] ✅ Dry-run support
- [x] ✅ Statistics reporting
- [x] ✅ Tested and verified working

## 📝 Monitoring & Logs

Cron jobs akan mencatat aktivitas di database Log table dengan action:
- `TICKET_CLEANUP_START`
- `TICKET_CLEANUP_COMPLETE`

Monitor logs untuk memastikan cleanup berjalan dengan baik.

## 🎯 Rekomendasi Schedule

1. **Harian**: Cleanup ticket > 24 jam (jam 2 pagi)
2. **Mingguan**: Cleanup semua PENDING ticket (hari Minggu jam 3 pagi)
3. **Monitoring**: Check statistics setiap hari (jam 1 pagi)

Implementasi cron sudah lengkap dan siap untuk production! 🚀
