/**
 * Database Seeding Script for VBTix
 * 
 * This script populates the database with sample data for testing purposes.
 * It creates organizer accounts, events, tickets, and other necessary data.
 * 
 * Usage: npm run seed
 * 
 * Features:
 * - Creates multiple organizer accounts with verified status
 * - Generates realistic Indonesian events with proper categorization
 * - Creates ticket types for each event with different pricing tiers
 * - Uses working image URLs from reliable sources
 * - Handles duplicate prevention and safe re-running
 * - Follows existing 3-tier architecture patterns
 */

import { PrismaClient, UserRole, EventStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Create slug function (copied from utils to avoid import issues)
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

const prisma = new PrismaClient();

// Configuration
const SEED_CONFIG = {
  organizerCount: 5,
  eventsPerOrganizer: 3,
  ticketTypesPerEvent: 3,
  defaultPassword: 'password123',
  hashRounds: 12,
};

// Sample data for Indonesian events
const INDONESIAN_CITIES = [
  { city: 'Jakarta', province: 'DKI Jakarta' },
  { city: 'Bandung', province: 'Jawa Barat' },
  { city: 'Surabaya', province: 'Jawa Timur' },
  { city: 'Yogyakarta', province: 'DI Yogyakarta' },
  { city: 'Medan', province: 'Sumatera Utara' },
  { city: 'Semarang', province: 'Jawa Tengah' },
  { city: 'Makassar', province: 'Sulawesi Selatan' },
  { city: 'Denpasar', province: 'Bali' },
  { city: 'Palembang', province: 'Sumatera Selatan' },
  { city: 'Malang', province: 'Jawa Timur' },
];

const EVENT_CATEGORIES = [
  'Konser Musik',
  'Seminar & Workshop',
  'Festival Budaya',
  'Pameran Seni',
  'Olahraga',
  'Teknologi',
  'Kuliner',
  'Fashion',
  'Pendidikan',
  'Bisnis',
];

const VENUE_TYPES = [
  'Gedung Konvensi',
  'Hotel',
  'Universitas',
  'Stadion',
  'Taman Kota',
  'Mall',
  'Gedung Kesenian',
  'Pusat Budaya',
  'Balai Kota',
  'Auditorium',
];

// Working image URLs from reliable sources
const SAMPLE_IMAGES = {
  banners: [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&h=400&fit=crop',
  ],
  posters: [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&h=800&fit=crop',
  ],
  profiles: [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
  ],
};

// Sample organizer data
const SAMPLE_ORGANIZERS = [
  {
    name: 'Budi Santoso',
    email: 'budi.santoso@eventorganizer.id',
    orgName: 'Jakarta Event Management',
    legalName: 'PT Jakarta Event Management Indonesia',
    phone: '+62812345678901',
    npwp: '12.345.678.9-012.000',
  },
  {
    name: 'Sari Dewi',
    email: 'sari.dewi@creativeevent.id',
    orgName: 'Creative Event Solutions',
    legalName: 'CV Creative Event Solutions',
    phone: '+62812345678902',
    npwp: '23.456.789.0-123.000',
  },
  {
    name: 'Ahmad Rahman',
    email: 'ahmad.rahman@megaevent.id',
    orgName: 'Mega Event Organizer',
    legalName: 'PT Mega Event Organizer Nusantara',
    phone: '+62812345678903',
    npwp: '34.567.890.1-234.000',
  },
  {
    name: 'Rina Kusuma',
    email: 'rina.kusuma@premiumevent.id',
    orgName: 'Premium Event Services',
    legalName: 'PT Premium Event Services Indonesia',
    phone: '+62812345678904',
    npwp: '45.678.901.2-345.000',
  },
  {
    name: 'Doni Pratama',
    email: 'doni.pratama@innovativeevent.id',
    orgName: 'Innovative Event Planner',
    legalName: 'CV Innovative Event Planner',
    phone: '+62812345678905',
    npwp: '56.789.012.3-456.000',
  },
];

/**
 * Utility functions
 */
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateRandomDate(daysFromNow, daysRange = 30) {
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + daysFromNow);
  const randomDays = Math.floor(Math.random() * daysRange);
  baseDate.setDate(baseDate.getDate() + randomDays);
  return baseDate;
}

function generateEventTitle(category) {
  const eventTitles = {
    'Konser Musik': [
      'Festival Musik Nusantara 2025',
      'Konser Akustik Indie Indonesia',
      'Jazz Under The Stars',
      'Rock Festival Jakarta',
      'Musik Tradisional Modern',
    ],
    'Seminar & Workshop': [
      'Workshop Digital Marketing 2025',
      'Seminar Kewirausahaan Muda',
      'Pelatihan Leadership Modern',
      'Workshop Fotografi Profesional',
      'Seminar Teknologi Terkini',
    ],
    'Festival Budaya': [
      'Festival Budaya Nusantara',
      'Pameran Kerajinan Tradisional',
      'Festival Kuliner Daerah',
      'Pertunjukan Seni Tradisional',
      'Festival Batik Indonesia',
    ],
    'Pameran Seni': [
      'Pameran Lukisan Kontemporer',
      'Galeri Seni Rupa Modern',
      'Pameran Fotografi Dokumenter',
      'Seni Instalasi Indonesia',
      'Pameran Keramik Nusantara',
    ],
    'Olahraga': [
      'Turnamen Badminton Terbuka',
      'Marathon Jakarta 2025',
      'Kompetisi Futsal Antar Kota',
      'Kejuaraan Renang Nasional',
      'Turnamen Basket 3x3',
    ],
  };

  const titles = eventTitles[category] || [
    'Event Spesial 2025',
    'Acara Komunitas',
    'Gathering Tahunan',
    'Perayaan Khusus',
    'Event Eksklusif',
  ];

  return getRandomElement(titles);
}

/**
 * Create organizer accounts with complete profile information
 */
async function createOrganizers() {
  console.log('🏢 Creating organizer accounts...\n');

  const hashedPassword = await bcrypt.hash(SEED_CONFIG.defaultPassword, SEED_CONFIG.hashRounds);
  const createdOrganizers = [];

  for (let i = 0; i < SAMPLE_ORGANIZERS.length; i++) {
    const organizerData = SAMPLE_ORGANIZERS[i];
    
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: organizerData.email }
      });

      if (existingUser) {
        console.log(`⚠️  User ${organizerData.email} already exists, skipping...`);
        
        // Get the organizer record
        const existingOrganizer = await prisma.organizer.findUnique({
          where: { userId: existingUser.id },
          include: { user: true }
        });
        
        if (existingOrganizer) {
          createdOrganizers.push(existingOrganizer);
        }
        continue;
      }

      // Create user and organizer in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user with ORGANIZER role
        const user = await tx.user.create({
          data: {
            name: organizerData.name,
            email: organizerData.email,
            password: hashedPassword,
            phone: organizerData.phone,
            role: UserRole.ORGANIZER,
            emailVerified: new Date(), // Mark as verified for testing
            image: getRandomElement(SAMPLE_IMAGES.profiles),
          },
        });

        // Create organizer record
        const organizer = await tx.organizer.create({
          data: {
            userId: user.id,
            orgName: organizerData.orgName,
            legalName: organizerData.legalName,
            npwp: organizerData.npwp,
            verified: true, // Mark as verified for testing
            socialMedia: {
              website: `https://www.${organizerData.orgName.toLowerCase().replace(/\s+/g, '')}.com`,
              instagram: `@${organizerData.orgName.toLowerCase().replace(/\s+/g, '')}`,
              facebook: organizerData.orgName,
            },
          },
          include: {
            user: true,
          },
        });

        return organizer;
      });

      createdOrganizers.push(result);
      console.log(`✅ Created organizer: ${result.orgName} (${result.user.email})`);

    } catch (error) {
      console.error(`❌ Failed to create organizer ${organizerData.email}:`, error.message);
    }
  }

  console.log(`\n🎉 Successfully created ${createdOrganizers.length} organizers\n`);
  return createdOrganizers;
}

/**
 * Create events for each organizer
 */
async function createEvents(organizers) {
  console.log('📅 Creating events...\n');

  const createdEvents = [];

  for (const organizer of organizers) {
    console.log(`Creating events for ${organizer.orgName}...`);

    for (let i = 0; i < SEED_CONFIG.eventsPerOrganizer; i++) {
      try {
        const category = getRandomElement(EVENT_CATEGORIES);
        const location = getRandomElement(INDONESIAN_CITIES);
        const venue = getRandomElement(VENUE_TYPES);
        const title = generateEventTitle(category);

        // Generate unique slug
        let slug = createSlug(title);
        const existingEvent = await prisma.event.findUnique({ where: { slug } });
        if (existingEvent) {
          const randomString = Math.random().toString(36).substring(2, 7);
          slug = `${slug}-${randomString}`;
        }

        // Generate event dates
        const startDate = generateRandomDate(7, 90); // 7-97 days from now
        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + Math.floor(Math.random() * 8) + 2); // 2-10 hours duration

        // Determine event status based on current system requirements
        const statuses = [EventStatus.PUBLISHED, EventStatus.PENDING_REVIEW, EventStatus.DRAFT];
        const weights = [0.6, 0.3, 0.1]; // 60% published, 30% pending, 10% draft
        const randomValue = Math.random();
        let status = EventStatus.PUBLISHED;
        let cumulative = 0;
        for (let j = 0; j < statuses.length; j++) {
          cumulative += weights[j];
          if (randomValue <= cumulative) {
            status = statuses[j];
            break;
          }
        }

        const eventData = {
          title,
          slug,
          description: generateEventDescription(category, title),
          category,
          venue: `${venue} ${location.city}`,
          address: `Jl. ${getRandomElement(['Sudirman', 'Thamrin', 'Gatot Subroto', 'Kuningan', 'Senayan'])} No. ${Math.floor(Math.random() * 100) + 1}`,
          city: location.city,
          province: location.province,
          country: 'Indonesia',
          startDate,
          endDate,
          status,
          organizerId: organizer.id,
          bannerUrl: getRandomElement(SAMPLE_IMAGES.banners),
          posterUrl: getRandomElement(SAMPLE_IMAGES.posters),
          images: getRandomElements(SAMPLE_IMAGES.banners, 2),
          tags: generateEventTags(category),
          featured: Math.random() < 0.2, // 20% chance to be featured
          maxAttendees: Math.floor(Math.random() * 1000) + 100, // 100-1100 attendees
          website: `https://www.${slug}.com`,
          terms: 'Syarat dan ketentuan berlaku. Tiket yang sudah dibeli tidak dapat dikembalikan kecuali acara dibatalkan oleh penyelenggara.',
        };

        const event = await prisma.event.create({
          data: eventData,
        });

        createdEvents.push(event);
        console.log(`  ✅ Created event: ${event.title} (${event.status})`);

      } catch (error) {
        console.error(`  ❌ Failed to create event for ${organizer.orgName}:`, error.message);
      }
    }
  }

  console.log(`\n🎉 Successfully created ${createdEvents.length} events\n`);
  return createdEvents;
}

/**
 * Generate event description based on category
 */
function generateEventDescription(category, title) {
  const descriptions = {
    'Konser Musik': `Nikmati pengalaman musik yang tak terlupakan di ${title}. Acara ini menampilkan artis-artis terbaik dengan sound system berkualitas tinggi dan lighting yang memukau. Jangan lewatkan kesempatan untuk merasakan atmosfer musik yang luar biasa bersama ribuan penggemar musik lainnya.`,

    'Seminar & Workshop': `Bergabunglah dengan ${title} dan tingkatkan pengetahuan serta keterampilan Anda. Acara ini menghadirkan pembicara ahli di bidangnya dengan materi yang praktis dan aplikatif. Dapatkan sertifikat dan networking dengan peserta lainnya.`,

    'Festival Budaya': `Rayakan kekayaan budaya Indonesia di ${title}. Festival ini menampilkan berbagai pertunjukan seni tradisional, pameran kerajinan, dan kuliner khas daerah. Acara yang cocok untuk seluruh keluarga dengan berbagai aktivitas menarik.`,

    'Pameran Seni': `Jelajahi dunia seni kontemporer di ${title}. Pameran ini menampilkan karya-karya seniman terbaik dengan berbagai medium dan teknik. Kesempatan langka untuk berinteraksi langsung dengan para seniman dan kolektor seni.`,

    'Olahraga': `Saksikan pertandingan seru di ${title}. Kompetisi ini mempertemukan atlet-atlet terbaik dalam pertandingan yang penuh adrenalin. Dukung tim favorit Anda dan rasakan atmosfer stadion yang meriah.`,
  };

  return descriptions[category] || `Bergabunglah dengan ${title}, sebuah acara istimewa yang akan memberikan pengalaman tak terlupakan. Acara ini dirancang khusus untuk memberikan nilai tambah bagi semua peserta dengan berbagai aktivitas menarik dan bermanfaat.`;
}

/**
 * Generate event tags based on category
 */
function generateEventTags(category) {
  const tagsByCategory = {
    'Konser Musik': ['musik', 'konser', 'live-music', 'entertainment', 'weekend'],
    'Seminar & Workshop': ['edukasi', 'workshop', 'seminar', 'skill-development', 'networking'],
    'Festival Budaya': ['budaya', 'festival', 'tradisional', 'keluarga', 'weekend'],
    'Pameran Seni': ['seni', 'pameran', 'art', 'galeri', 'kultur'],
    'Olahraga': ['olahraga', 'kompetisi', 'turnamen', 'sport', 'atlet'],
  };

  const baseTags = tagsByCategory[category] || ['event', 'acara', 'indonesia'];
  const commonTags = ['jakarta', 'indonesia', '2025', 'tiket-online'];

  return [...baseTags, ...getRandomElements(commonTags, 2)];
}

/**
 * Create ticket types for each event
 */
async function createTicketTypes(events) {
  console.log('🎫 Creating ticket types...\n');

  const createdTicketTypes = [];

  for (const event of events) {
    console.log(`Creating tickets for ${event.title}...`);

    try {
      // Define ticket type templates based on event category
      const ticketTemplates = getTicketTemplates(event.category);

      for (const template of ticketTemplates) {
        const ticketTypeData = {
          eventId: event.id,
          name: template.name,
          description: template.description,
          price: template.price,
          currency: 'IDR',
          quantity: template.quantity,
          sold: Math.floor(Math.random() * (template.quantity * 0.3)), // 0-30% sold
          maxPerPurchase: template.maxPerPurchase,
          isVisible: true,
          allowTransfer: template.allowTransfer,
          ticketFeatures: template.features,
          perks: template.perks,
          saleStartDate: new Date(), // Available now
          saleEndDate: new Date(event.startDate.getTime() - 24 * 60 * 60 * 1000), // 1 day before event
        };

        // Add early bird deadline for some tickets
        if (template.isEarlyBird) {
          const earlyBirdDate = new Date();
          earlyBirdDate.setDate(earlyBirdDate.getDate() + 14); // 2 weeks from now
          ticketTypeData.earlyBirdDeadline = earlyBirdDate;
        }

        const ticketType = await prisma.ticketType.create({
          data: ticketTypeData,
        });

        createdTicketTypes.push(ticketType);
        console.log(`  ✅ Created ticket: ${ticketType.name} - Rp ${ticketType.price.toLocaleString()}`);
      }

    } catch (error) {
      console.error(`  ❌ Failed to create tickets for ${event.title}:`, error.message);
    }
  }

  console.log(`\n🎉 Successfully created ${createdTicketTypes.length} ticket types\n`);
  return createdTicketTypes;
}

/**
 * Get ticket templates based on event category
 */
function getTicketTemplates(category) {
  const templates = {
    'Konser Musik': [
      {
        name: 'Early Bird',
        description: 'Tiket dengan harga spesial untuk pembelian awal',
        price: 150000,
        quantity: 100,
        maxPerPurchase: 4,
        allowTransfer: true,
        isEarlyBird: true,
        features: 'Akses masuk, Standing area',
        perks: 'Harga spesial, Merchandise gratis',
      },
      {
        name: 'Regular',
        description: 'Tiket reguler dengan akses penuh ke acara',
        price: 200000,
        quantity: 500,
        maxPerPurchase: 6,
        allowTransfer: true,
        features: 'Akses masuk, Standing area',
        perks: 'Akses penuh ke acara',
      },
      {
        name: 'VIP',
        description: 'Tiket VIP dengan fasilitas premium',
        price: 500000,
        quantity: 50,
        maxPerPurchase: 2,
        allowTransfer: false,
        features: 'Akses VIP area, Sitting area, Meet & greet',
        perks: 'Merchandise eksklusif, Makanan & minuman, Foto bersama artis',
      },
    ],
    'Seminar & Workshop': [
      {
        name: 'Early Bird',
        description: 'Tiket dengan harga spesial untuk pendaftaran awal',
        price: 100000,
        quantity: 50,
        maxPerPurchase: 2,
        allowTransfer: true,
        isEarlyBird: true,
        features: 'Akses seminar, Materi digital',
        perks: 'Harga spesial, Sertifikat digital',
      },
      {
        name: 'Regular',
        description: 'Tiket reguler dengan akses penuh ke seminar',
        price: 150000,
        quantity: 200,
        maxPerPurchase: 3,
        allowTransfer: true,
        features: 'Akses seminar, Materi digital, Sertifikat',
        perks: 'Networking session, Coffee break',
      },
      {
        name: 'Premium',
        description: 'Tiket premium dengan fasilitas lengkap',
        price: 300000,
        quantity: 30,
        maxPerPurchase: 2,
        allowTransfer: false,
        features: 'Akses seminar, Materi fisik & digital, Sertifikat',
        perks: 'Lunch, Networking dinner, 1-on-1 session dengan pembicara',
      },
    ],
    'Festival Budaya': [
      {
        name: 'Anak-anak',
        description: 'Tiket khusus untuk anak-anak (3-12 tahun)',
        price: 25000,
        quantity: 200,
        maxPerPurchase: 4,
        allowTransfer: true,
        features: 'Akses festival, Area bermain anak',
        perks: 'Aktivitas khusus anak, Goodie bag',
      },
      {
        name: 'Dewasa',
        description: 'Tiket untuk dewasa dengan akses penuh',
        price: 50000,
        quantity: 800,
        maxPerPurchase: 6,
        allowTransfer: true,
        features: 'Akses penuh festival, Semua pertunjukan',
        perks: 'Sampling kuliner, Workshop gratis',
      },
      {
        name: 'Keluarga',
        description: 'Paket tiket keluarga (2 dewasa + 2 anak)',
        price: 120000,
        quantity: 100,
        maxPerPurchase: 2,
        allowTransfer: true,
        features: 'Akses penuh untuk 4 orang, Area khusus keluarga',
        perks: 'Diskon kuliner, Photo booth gratis, Goodie bag keluarga',
      },
    ],
  };

  // Default template for other categories
  const defaultTemplate = [
    {
      name: 'Early Bird',
      description: 'Tiket dengan harga spesial untuk pembelian awal',
      price: 75000,
      quantity: 100,
      maxPerPurchase: 4,
      allowTransfer: true,
      isEarlyBird: true,
      features: 'Akses penuh ke acara',
      perks: 'Harga spesial',
    },
    {
      name: 'Regular',
      description: 'Tiket reguler dengan akses penuh',
      price: 100000,
      quantity: 300,
      maxPerPurchase: 6,
      allowTransfer: true,
      features: 'Akses penuh ke acara',
      perks: 'Akses penuh',
    },
    {
      name: 'VIP',
      description: 'Tiket VIP dengan fasilitas premium',
      price: 250000,
      quantity: 50,
      maxPerPurchase: 2,
      allowTransfer: false,
      features: 'Akses VIP, Fasilitas premium',
      perks: 'Makanan & minuman, Merchandise',
    },
  ];

  return templates[category] || defaultTemplate;
}

/**
 * Create some sample buyer accounts for testing
 */
async function createSampleBuyers() {
  console.log('👥 Creating sample buyer accounts...\n');

  const hashedPassword = await bcrypt.hash(SEED_CONFIG.defaultPassword, SEED_CONFIG.hashRounds);
  const sampleBuyers = [
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+62812345678910',
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+62812345678911',
    },
    {
      name: 'Andi Wijaya',
      email: 'andi.wijaya@example.com',
      phone: '+62812345678912',
    },
  ];

  const createdBuyers = [];

  for (const buyerData of sampleBuyers) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: buyerData.email }
      });

      if (existingUser) {
        console.log(`⚠️  Buyer ${buyerData.email} already exists, skipping...`);
        createdBuyers.push(existingUser);
        continue;
      }

      const buyer = await prisma.user.create({
        data: {
          name: buyerData.name,
          email: buyerData.email,
          password: hashedPassword,
          phone: buyerData.phone,
          role: UserRole.BUYER,
          emailVerified: new Date(),
          image: getRandomElement(SAMPLE_IMAGES.profiles),
        },
      });

      createdBuyers.push(buyer);
      console.log(`✅ Created buyer: ${buyer.name} (${buyer.email})`);

    } catch (error) {
      console.error(`❌ Failed to create buyer ${buyerData.email}:`, error.message);
    }
  }

  console.log(`\n🎉 Successfully created ${createdBuyers.length} buyer accounts\n`);
  return createdBuyers;
}

/**
 * Display seeding summary
 */
function displaySummary(organizers, events, ticketTypes, buyers) {
  console.log('\n' + '='.repeat(60));
  console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log(`📊 Summary:`);
  console.log(`   👥 Organizers created: ${organizers.length}`);
  console.log(`   📅 Events created: ${events.length}`);
  console.log(`   🎫 Ticket types created: ${ticketTypes.length}`);
  console.log(`   🛒 Buyer accounts created: ${buyers.length}`);
  console.log('\n📋 Test Accounts:');
  console.log('   🔐 Default password for all accounts: password123');
  console.log('\n👥 Organizer Accounts:');
  organizers.forEach(org => {
    console.log(`   📧 ${org.user.email} - ${org.orgName}`);
  });
  console.log('\n🛒 Buyer Accounts:');
  buyers.forEach(buyer => {
    console.log(`   📧 ${buyer.email} - ${buyer.name}`);
  });
  console.log('\n📅 Event Status Distribution:');
  const statusCounts = events.reduce((acc, event) => {
    acc[event.status] = (acc[event.status] || 0) + 1;
    return acc;
  }, {});
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`   ${status}: ${count} events`);
  });
  console.log('\n🎯 Next Steps:');
  console.log('   1. Start the development server: npm run dev');
  console.log('   2. Login with any of the test accounts');
  console.log('   3. Test the organizer dashboard and event management');
  console.log('   4. Test the public event browsing and ticket purchasing');
  console.log('   5. Test the admin dashboard (create admin account separately)');
  console.log('\n' + '='.repeat(60));
}

/**
 * Main seeding function
 */
async function main() {
  console.log('🌱 Starting database seeding...\n');
  console.log('📋 Configuration:');
  console.log(`   Organizers: ${SEED_CONFIG.organizerCount}`);
  console.log(`   Events per organizer: ${SEED_CONFIG.eventsPerOrganizer}`);
  console.log(`   Ticket types per event: ${SEED_CONFIG.ticketTypesPerEvent}`);
  console.log(`   Default password: ${SEED_CONFIG.defaultPassword}`);
  console.log('\n' + '='.repeat(60) + '\n');

  try {
    // Connect to database
    await prisma.$connect();
    console.log('✅ Connected to database\n');

    // Create organizers
    const organizers = await createOrganizers();

    // Create events
    const events = await createEvents(organizers);

    // Create ticket types
    const ticketTypes = await createTicketTypes(events);

    // Create sample buyers
    const buyers = await createSampleBuyers();

    // Display summary
    displaySummary(organizers, events, ticketTypes, buyers);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

/**
 * Handle cleanup on exit
 */
process.on('SIGINT', async () => {
  console.log('\n⚠️  Seeding interrupted by user');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Seeding terminated');
  await prisma.$disconnect();
  process.exit(0);
});

// Run the seeding
main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
