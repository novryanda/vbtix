# Database Seeding Guide for VBTix

This guide explains how to use the database seeding script to populate your VBTix development database with realistic sample data.

## Overview

The seeding script (`seed-database.js`) creates comprehensive test data including:

- **5 Organizer Accounts** with complete profiles and verification status
- **15 Events** (3 per organizer) with realistic Indonesian event data
- **45+ Ticket Types** with different pricing tiers and categories
- **3 Sample Buyer Accounts** for testing purchases
- **Proper relationships** between all entities following the 3-tier architecture

## Quick Start

### Prerequisites

1. Ensure your database is running and accessible
2. Run database migrations: `npm run db:push`
3. Make sure your `.env` file has the correct `DATABASE_URL`

### Running the Seeder

```bash
# Run the seeding script
npm run db:seed

# Alternative: Run directly with Node
node scripts/seed-database.js
```

### Expected Output

The script will display progress for each step:

```
🌱 Starting database seeding...

🏢 Creating organizer accounts...
✅ Created organizer: Jakarta Event Management (budi.santoso@eventorganizer.id)
✅ Created organizer: Creative Event Solutions (sari.dewi@creativeevent.id)
...

📅 Creating events...
✅ Created event: Festival Musik Nusantara 2025 (PUBLISHED)
✅ Created event: Workshop Digital Marketing 2025 (PENDING_REVIEW)
...

🎫 Creating ticket types...
✅ Created ticket: Early Bird - Rp 150,000
✅ Created ticket: Regular - Rp 200,000
...

🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!
```

## Test Accounts Created

### Organizer Accounts

All organizer accounts use the password: `password123`

| Email | Organization | Status |
|-------|-------------|--------|
| budi.santoso@eventorganizer.id | Jakarta Event Management | Verified |
| sari.dewi@creativeevent.id | Creative Event Solutions | Verified |
| ahmad.rahman@megaevent.id | Mega Event Organizer | Verified |
| rina.kusuma@premiumevent.id | Premium Event Services | Verified |
| doni.pratama@innovativeevent.id | Innovative Event Planner | Verified |

### Buyer Accounts

All buyer accounts use the password: `password123`

| Email | Name |
|-------|------|
| john.doe@example.com | John Doe |
| jane.smith@example.com | Jane Smith |
| andi.wijaya@example.com | Andi Wijaya |

## Sample Data Details

### Events

Events are created with realistic Indonesian data:

- **Categories**: Konser Musik, Seminar & Workshop, Festival Budaya, Pameran Seni, Olahraga
- **Locations**: Jakarta, Bandung, Surabaya, Yogyakarta, Medan, and more
- **Status Distribution**: 60% Published, 30% Pending Review, 10% Draft
- **Dates**: Events scheduled 7-97 days from seeding date
- **Images**: Working Unsplash URLs for banners and posters

### Ticket Types

Each event gets 3 ticket types with realistic pricing:

- **Early Bird**: Discounted prices with limited quantity
- **Regular**: Standard pricing with higher availability
- **VIP/Premium**: Higher prices with exclusive features

Pricing varies by event category:
- Music concerts: Rp 150K - 500K
- Seminars: Rp 100K - 300K
- Cultural festivals: Rp 25K - 120K

### Features

- **Safe Re-running**: Script checks for existing data and skips duplicates
- **Realistic Data**: Indonesian names, locations, and event types
- **Working Images**: Reliable Unsplash URLs that won't break
- **Proper Relationships**: All foreign keys and relationships maintained
- **Status Variety**: Mix of event statuses for testing approval workflows

## Configuration

You can modify the seeding configuration by editing the `SEED_CONFIG` object in the script:

```javascript
const SEED_CONFIG = {
  organizerCount: 5,           // Number of organizers to create
  eventsPerOrganizer: 3,       // Events per organizer
  ticketTypesPerEvent: 3,      // Ticket types per event
  defaultPassword: 'password123', // Default password for all accounts
  hashRounds: 12,              // bcrypt hash rounds
};
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```
   Error: Can't reach database server
   ```
   - Check if your database is running
   - Verify `DATABASE_URL` in `.env` file
   - Run `npm run db:push` to ensure schema is up to date

2. **Duplicate Key Errors**
   ```
   Error: Unique constraint failed
   ```
   - The script handles most duplicates automatically
   - If persistent, clear the database and re-run migrations

3. **Import Errors**
   ```
   Error: Cannot find module
   ```
   - Ensure all dependencies are installed: `npm install`
   - Check that the script is run from the project root

### Clearing Seeded Data

To remove all seeded data and start fresh:

```bash
# Reset database (WARNING: This removes ALL data)
npx prisma migrate reset

# Re-run migrations
npm run db:push

# Re-seed with fresh data
npm run db:seed
```

## Testing After Seeding

1. **Start the development server**: `npm run dev`
2. **Test organizer login**: Use any organizer email with password `password123`
3. **Check organizer dashboard**: Verify events and tickets are visible
4. **Test public pages**: Browse events without logging in
5. **Test buyer flow**: Register/login as buyer and attempt ticket purchase
6. **Admin testing**: Create admin account separately using existing scripts

## Integration with Development Workflow

The seeding script is designed to work seamlessly with your development workflow:

- **CI/CD**: Can be integrated into automated testing pipelines
- **Team Development**: Provides consistent test data across team members
- **Feature Testing**: Realistic data for testing new features
- **Demo Preparation**: Quick setup for demonstrations

## Customization

To customize the seeded data:

1. **Modify sample data arrays** (organizers, cities, categories)
2. **Adjust event generation logic** in `generateEventTitle()` and `generateEventDescription()`
3. **Update ticket templates** in `getTicketTemplates()`
4. **Change image URLs** in `SAMPLE_IMAGES` object

## Support

If you encounter issues with the seeding script:

1. Check the console output for specific error messages
2. Verify database connectivity and schema
3. Ensure all required environment variables are set
4. Review the troubleshooting section above

The seeding script follows the same patterns and architecture as the rest of the VBTix application, ensuring consistency and reliability.
