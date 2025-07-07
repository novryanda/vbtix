# Database Seeding Implementation for VBTix

## Overview

This document describes the comprehensive database seeding system implemented for the VBTix event ticketing platform. The seeding script creates realistic test data that follows the existing 3-tier architecture and database schema.

## Files Created

### 1. Main Seeding Script
- **File**: `scripts/seed-database.js`
- **Purpose**: Main seeding script that populates the database with sample data
- **Features**: 
  - Creates organizer accounts with complete profiles
  - Generates realistic Indonesian events with proper categorization
  - Creates ticket types with different pricing tiers
  - Uses working image URLs from reliable sources
  - Handles duplicate prevention and safe re-running

### 2. Package.json Script
- **Addition**: `"db:seed": "node scripts/seed-database.js"`
- **Usage**: `npm run db:seed`

### 3. Documentation
- **File**: `scripts/README-SEEDING.md`
- **Purpose**: Comprehensive guide for using the seeding script

### 4. Test Script
- **File**: `scripts/test-seed-data.js`
- **Purpose**: Validates data generation functions without database operations

## Data Created

### Organizer Accounts (5 accounts)
```javascript
{
  name: 'Budi Santoso',
  email: 'budi.santoso@eventorganizer.id',
  orgName: 'Jakarta Event Management',
  legalName: 'PT Jakarta Event Management Indonesia',
  phone: '+62812345678901',
  npwp: '12.345.678.9-012.000',
  role: 'ORGANIZER',
  verified: true,
  emailVerified: true
}
```

### Events (15 events total - 3 per organizer)
```javascript
{
  title: 'Festival Musik Nusantara 2025',
  category: 'Konser Musik',
  venue: 'Gedung Konvensi Jakarta',
  city: 'Jakarta',
  province: 'DKI Jakarta',
  country: 'Indonesia',
  status: 'PUBLISHED', // 60% published, 30% pending, 10% draft
  startDate: '2025-07-15T19:00:00Z',
  endDate: '2025-07-15T23:00:00Z',
  bannerUrl: 'https://images.unsplash.com/photo-...',
  tags: ['musik', 'konser', 'live-music', 'entertainment']
}
```

### Ticket Types (3 per event = 45+ total)
```javascript
{
  name: 'Early Bird',
  description: 'Tiket dengan harga spesial untuk pembelian awal',
  price: 150000,
  currency: 'IDR',
  quantity: 100,
  sold: 0-30, // Random sold count
  maxPerPurchase: 4,
  isVisible: true,
  allowTransfer: true,
  features: 'Akses masuk, Standing area',
  perks: 'Harga spesial, Merchandise gratis'
}
```

### Buyer Accounts (3 accounts)
```javascript
{
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+62812345678910',
  role: 'BUYER',
  emailVerified: true
}
```

## Technical Implementation

### Architecture Compliance
- **3-Tier Architecture**: Follows existing service layer patterns
- **Database Schema**: Uses exact Prisma schema definitions
- **Validation**: Respects all database constraints and relationships
- **Error Handling**: Comprehensive error handling and logging

### Key Features

#### 1. Safe Re-running
```javascript
// Check if user already exists
const existingUser = await prisma.user.findUnique({
  where: { email: organizerData.email }
});

if (existingUser) {
  console.log(`⚠️  User ${organizerData.email} already exists, skipping...`);
  continue;
}
```

#### 2. Realistic Data Generation
```javascript
function generateEventTitle(category) {
  const eventTitles = {
    'Konser Musik': [
      'Festival Musik Nusantara 2025',
      'Konser Akustik Indie Indonesia',
      'Jazz Under The Stars'
    ],
    // ... more categories
  };
  return getRandomElement(eventTitles[category]);
}
```

#### 3. Proper Slug Generation
```javascript
// Generate unique slug
let slug = createSlug(title);
const existingEvent = await prisma.event.findUnique({ where: { slug } });
if (existingEvent) {
  const randomString = Math.random().toString(36).substring(2, 7);
  slug = `${slug}-${randomString}`;
}
```

#### 4. Transaction Safety
```javascript
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  const organizer = await tx.organizer.create({ 
    data: { ...organizerData, userId: user.id } 
  });
  return organizer;
});
```

### Data Quality

#### Indonesian Localization
- **Cities**: Jakarta, Bandung, Surabaya, Yogyakarta, Medan, etc.
- **Event Names**: Realistic Indonesian event titles
- **Descriptions**: Proper Bahasa Indonesia descriptions
- **Phone Numbers**: Indonesian format (+62xxx)
- **NPWP**: Realistic Indonesian tax ID format

#### Event Categories
- Konser Musik (Music Concerts)
- Seminar & Workshop
- Festival Budaya (Cultural Festivals)
- Pameran Seni (Art Exhibitions)
- Olahraga (Sports)

#### Pricing Strategy
- **Music Concerts**: Rp 150K - 500K
- **Seminars**: Rp 100K - 300K
- **Cultural Festivals**: Rp 25K - 120K
- **Art Exhibitions**: Rp 50K - 200K
- **Sports**: Rp 75K - 250K

### Image Management
- **Source**: Unsplash.com (reliable, high-quality images)
- **Categories**: Event banners, posters, profile pictures
- **Format**: Optimized URLs with size parameters
- **Reliability**: Tested URLs that won't break over time

## Usage Instructions

### Prerequisites
1. Database running and accessible
2. Environment variables configured
3. Prisma schema applied: `npm run db:push`

### Running the Seeder
```bash
# Run the seeding script
npm run db:seed

# Test data generation (without database)
node scripts/test-seed-data.js
```

### Post-Seeding Testing
1. **Organizer Login**: Use any organizer email with password `password123`
2. **Event Management**: Check organizer dashboard for events and tickets
3. **Public Browsing**: Browse events without authentication
4. **Buyer Flow**: Test registration and ticket purchasing
5. **Admin Functions**: Create admin account separately

## Configuration Options

### Seeding Configuration
```javascript
const SEED_CONFIG = {
  organizerCount: 5,           // Number of organizers
  eventsPerOrganizer: 3,       // Events per organizer
  ticketTypesPerEvent: 3,      // Ticket types per event
  defaultPassword: 'password123', // Default password
  hashRounds: 12,              // bcrypt hash rounds
};
```

### Customization Points
- **Sample Data Arrays**: Modify organizer data, cities, categories
- **Event Generation**: Customize title and description generation
- **Ticket Templates**: Adjust pricing and features by category
- **Image URLs**: Update image sources if needed

## Integration Benefits

### Development Workflow
- **Consistent Data**: Same test data across team members
- **Feature Testing**: Realistic data for testing new features
- **Demo Preparation**: Quick setup for demonstrations
- **CI/CD Integration**: Can be automated in testing pipelines

### Testing Scenarios
- **Organizer Workflows**: Event creation, ticket management
- **Buyer Journeys**: Event browsing, ticket purchasing
- **Admin Functions**: Event approval, organizer verification
- **Payment Testing**: Various ticket types and pricing
- **QR Code Generation**: Ticket validation workflows

## Maintenance

### Regular Updates
- **Image URLs**: Verify Unsplash URLs remain accessible
- **Data Relevance**: Update event dates and content periodically
- **Schema Changes**: Update seeding script when database schema changes
- **New Features**: Add seeding for new entities as they're implemented

### Monitoring
- **Execution Time**: Monitor seeding performance
- **Error Rates**: Track and resolve seeding failures
- **Data Quality**: Verify generated data meets requirements

## Security Considerations

### Test Data Safety
- **Non-Production Only**: Seeding script for development/testing only
- **Weak Passwords**: Uses simple passwords for testing convenience
- **Fake Data**: All personal information is fictional
- **No Sensitive Data**: No real payment or personal information

### Production Safeguards
- **Environment Checks**: Could add production environment detection
- **Confirmation Prompts**: Could require explicit confirmation
- **Data Isolation**: Ensure test data doesn't mix with production

This seeding implementation provides a robust foundation for VBTix development and testing, ensuring developers have access to realistic, comprehensive test data that accurately represents the production environment.
