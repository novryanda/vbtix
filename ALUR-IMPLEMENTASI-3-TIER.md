# Alur Implementasi Arsitektur API 3-Tier

Dokumen ini menjelaskan alur implementasi arsitektur API 3-tier dalam proyek VBTix, dengan fokus pada urutan pengembangan yang tepat.

## Daftar Isi

1. [Gambaran Umum](#1-gambaran-umum)
2. [Urutan Implementasi](#2-urutan-implementasi)
3. [Langkah 1: Validasi Schema](#3-langkah-1-validasi-schema)
4. [Langkah 2: Services (Tier 3)](#4-langkah-2-services-tier-3)
5. [Langkah 3: Business Logic (Tier 2)](#5-langkah-3-business-logic-tier-2)
6. [Langkah 4: Route Handlers (Tier 1)](#6-langkah-4-route-handlers-tier-1)
7. [Alur Data dalam Arsitektur 3-Tier](#7-alur-data-dalam-arsitektur-3-tier)
8. [Praktik Terbaik](#8-praktik-terbaik)

## 1. Gambaran Umum

Arsitektur 3-tier membagi aplikasi menjadi tiga lapisan terpisah:

- **Tier 1: HTTP Routing (Route Handlers)** - Menangani HTTP request dan response
- **Tier 2: Business Logic** - Memproses data dan menerapkan aturan bisnis
- **Tier 3: Services** - Berinteraksi dengan database dan layanan eksternal

Saat mengimplementasikan arsitektur ini, kita biasanya memulai dari lapisan terdalam (Tier 3) dan bergerak ke luar, karena setiap lapisan bergantung pada lapisan di bawahnya.

## 2. Urutan Implementasi

Urutan implementasi yang tepat adalah:

1. **Validasi Schema** - Mendefinisikan struktur data dan validasi
2. **Services (Tier 3)** - Implementasi akses database
3. **Business Logic (Tier 2)** - Implementasi logika bisnis
4. **Route Handlers (Tier 1)** - Implementasi endpoint API

## 3. Langkah 1: Validasi Schema

### Tujuan
Mendefinisikan struktur data dan aturan validasi menggunakan Zod.

### Lokasi
`src/lib/validations/`

### Langkah-langkah
1. Identifikasi entitas utama dalam aplikasi (Event, User, Order, dll.)
2. Buat file schema untuk setiap entitas (misalnya `event.schema.ts`)
3. Definisikan schema dasar menggunakan Zod
4. Buat schema turunan untuk operasi spesifik (create, update, dll.)

### Contoh

```typescript
// src/lib/validations/event.schema.ts
import { z } from 'zod';

// Schema dasar untuk Event
export const eventSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: 'Event name cannot be empty' }),
  description: z.string().optional(),
  date: z.string().datetime(),
  location: z.string().min(1),
  organizerId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema untuk membuat event baru
export const createEventSchema = eventSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Schema untuk memperbarui event
export const updateEventSchema = eventSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Export tipe TypeScript
export type EventSchema = z.infer<typeof eventSchema>;
```

## 4. Langkah 2: Services (Tier 3)

### Tujuan
Mengimplementasikan interaksi dengan database dan layanan eksternal.

### Lokasi
`src/server/services/`

### Tanggung Jawab
- Operasi CRUD dasar
- Interaksi dengan database menggunakan Prisma
- Panggilan ke API eksternal
- Caching (jika diperlukan)

### Langkah-langkah
1. Buat file service untuk setiap entitas (misalnya `event.service.ts`)
2. Implementasikan fungsi-fungsi CRUD
3. Tangani error database

### Contoh

```typescript
// src/server/services/event.service.ts
import { db } from "~/server/db";
import { Prisma, EventStatus } from "@prisma/client";

export const eventService = {
  /**
   * Mencari event berdasarkan ID
   */
  async findById(id: string) {
    try {
      return await db.event.findUnique({
        where: { id },
        include: { organizer: true }
      });
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  /**
   * Mencari semua event dengan filter dan pagination
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    status?: EventStatus;
    organizerId?: string;
  }) {
    const { page = 1, limit = 10, status, organizerId } = params;
    const skip = (page - 1) * limit;
    
    try {
      const where: Prisma.EventWhereInput = {};
      
      if (status) {
        where.status = status;
      }
      
      if (organizerId) {
        where.organizerId = organizerId;
      }
      
      const [events, total] = await Promise.all([
        db.event.findMany({
          where,
          skip,
          take: limit,
          orderBy: { date: 'asc' },
          include: { organizer: true }
        }),
        db.event.count({ where })
      ]);
      
      return { events, total };
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  /**
   * Membuat event baru
   */
  async createEvent(data: Prisma.EventCreateInput) {
    try {
      return await db.event.create({
        data,
        include: { organizer: true }
      });
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  /**
   * Memperbarui event
   */
  async updateEvent(id: string, data: Prisma.EventUpdateInput) {
    try {
      return await db.event.update({
        where: { id },
        data,
        include: { organizer: true }
      });
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  }
};
```

## 5. Langkah 3: Business Logic (Tier 2)

### Tujuan
Mengimplementasikan logika bisnis dan orkestrasi services.

### Lokasi
`src/server/api/`

### Tanggung Jawab
- Implementasi logika bisnis
- Validasi data yang lebih kompleks
- Orkestrasi panggilan ke services
- Transformasi data

### Langkah-langkah
1. Buat file business logic untuk setiap domain (misalnya `events.ts`)
2. Implementasikan fungsi-fungsi handler
3. Lakukan validasi bisnis
4. Panggil services yang sesuai

### Contoh

```typescript
// src/server/api/events.ts
import { eventService } from "~/server/services/event.service";
import { organizerService } from "~/server/services/organizer.service";
import { EventStatus } from "@prisma/client";

/**
 * Mendapatkan daftar event dengan pagination
 */
export async function handleGetEvents(params) {
  const { page = 1, limit = 10, status, organizerId } = params;
  
  // Validasi parameter
  const validPage = Math.max(1, Number(page));
  const validLimit = Math.min(100, Math.max(1, Number(limit)));
  
  // Memanggil service
  const { events, total } = await eventService.findAll({
    page: validPage,
    limit: validLimit,
    status,
    organizerId
  });
  
  // Transformasi data jika diperlukan
  const processedEvents = events.map(event => ({
    ...event,
    formattedDate: formatDate(event.date)
  }));
  
  // Menghitung metadata pagination
  const totalPages = Math.ceil(total / validLimit);
  
  return {
    events: processedEvents,
    meta: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages
    }
  };
}

/**
 * Membuat event baru
 */
export async function handleCreateEvent(data, userId) {
  // Validasi tambahan jika diperlukan
  
  // Cek apakah user adalah organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }
  
  // Menyiapkan data event
  const eventData = {
    ...data,
    organizerId: organizer.id,
    status: EventStatus.DRAFT
  };
  
  // Memanggil service untuk membuat event
  const event = await eventService.createEvent(eventData);
  
  return event;
}
```

## 6. Langkah 4: Route Handlers (Tier 1)

### Tujuan
Mengimplementasikan endpoint API yang menangani HTTP request dan response.

### Lokasi
`src/app/api/`

### Tanggung Jawab
- Menerima HTTP request
- Validasi input dasar menggunakan schema Zod
- Autentikasi dan otorisasi
- Memanggil business logic yang sesuai
- Mengembalikan HTTP response

### Langkah-langkah
1. Buat file route handler untuk setiap endpoint API
2. Implementasikan fungsi HTTP (GET, POST, PUT, DELETE)
3. Lakukan autentikasi dan otorisasi
4. Validasi input menggunakan schema Zod
5. Panggil business logic yang sesuai
6. Format response

### Contoh

```typescript
// src/app/api/admin/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleGetEvents, handleCreateEvent } from "~/server/api/events";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { createEventSchema } from "~/lib/validations/event.schema";

/**
 * GET /api/admin/events
 * Get all events with pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins can access this endpoint
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const status = searchParams.get("status") as EventStatus | undefined;
    const organizerId = searchParams.get("organizerId");

    // Call business logic
    const result = await handleGetEvents({
      page,
      limit,
      status,
      organizerId
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: result.events,
      meta: result.meta
    });
  } catch (error) {
    console.error("Error getting events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get events" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/events
 * Create a new event
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins and organizers can create events
    if (![UserRole.ADMIN, UserRole.ORGANIZER].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    
    try {
      // Validate input using Zod schema
      const validatedData = createEventSchema.parse(body);
      
      // Call business logic
      const event = await handleCreateEvent(validatedData, session.user.id);
      
      // Return response
      return NextResponse.json({
        success: true,
        data: event
      });
    } catch (validationError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: validationError },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}
```

## 7. Alur Data dalam Arsitektur 3-Tier

Setelah implementasi selesai, alur data dalam arsitektur 3-tier adalah sebagai berikut:

1. **Client mengirim HTTP request** ke endpoint API

2. **Route handler (Tier 1)** menerima request:
   - Melakukan autentikasi dan otorisasi
   - Memvalidasi input menggunakan schema Zod
   - Memanggil business logic dengan data yang sudah divalidasi

3. **Business logic (Tier 2)** memproses request:
   - Melakukan validasi bisnis tambahan
   - Mengorkestrasi panggilan ke services
   - Mentransformasi data jika diperlukan

4. **Service (Tier 3)** berinteraksi dengan database:
   - Melakukan operasi CRUD menggunakan Prisma
   - Mengembalikan hasil query ke business logic

5. **Business logic** menerima data dari service:
   - Melakukan transformasi data jika diperlukan
   - Mengembalikan hasil ke route handler

6. **Route handler** menerima hasil dari business logic:
   - Memformat response sesuai standar API
   - Mengembalikan HTTP response ke client

7. **Client menerima HTTP response**

## 8. Praktik Terbaik

### Validasi Schema
- Buat schema terpisah untuk operasi berbeda (create, update, dll.)
- Gunakan pesan error yang jelas dan informatif
- Manfaatkan transformasi Zod untuk mengubah format data

### Services (Tier 3)
- Fokus pada operasi CRUD dasar
- Tangani error database dengan baik
- Gunakan transaksi untuk operasi yang kompleks
- Jangan melakukan validasi bisnis di service

### Business Logic (Tier 2)
- Fokus pada implementasi aturan bisnis
- Orkestrasi panggilan ke multiple services jika diperlukan
- Transformasi data sesuai kebutuhan bisnis
- Validasi bisnis yang kompleks

### Route Handlers (Tier 1)
- Fokus pada HTTP request/response
- Autentikasi dan otorisasi
- Validasi input dasar dengan Zod
- Format response yang konsisten
- Error handling yang baik

Dengan mengikuti alur implementasi ini, Anda akan memiliki arsitektur API yang terstruktur, mudah dipelihara, dan mudah dikembangkan.