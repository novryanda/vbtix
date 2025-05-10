# Arsitektur API 3-Tier VBTix

Dokumen ini menjelaskan arsitektur API 3-tier yang digunakan dalam aplikasi VBTix, termasuk alur dari route handler hingga business logic dan database.

## Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Struktur Folder](#struktur-folder)
- [Tier 1: HTTP Routing](#tier-1-http-routing)
- [Tier 2: Business Logic](#tier-2-business-logic)
- [Tier 3: Services](#tier-3-services)
- [Alur Request](#alur-request)
- [Contoh Implementasi](#contoh-implementasi)
- [Error Handling](#error-handling)
- [Autentikasi dan Otorisasi](#autentikasi-dan-otorisasi)
- [Best Practices](#best-practices)

## Gambaran Umum

Arsitektur API 3-tier dalam aplikasi VBTix terdiri dari:

1. **Tier 1: HTTP Routing** - Menangani HTTP request dan response
2. **Tier 2: Business Logic** - Memproses data dan menerapkan aturan bisnis
3. **Tier 3: Services** - Berinteraksi dengan database dan layanan eksternal

Alur data:
```
Client → HTTP Request → Route Handler → Business Logic → Service → Database → Response
```

## Struktur Folder

```
src/
├── app/
│   └── api/
│       ├── admin/           # API untuk admin
│       │   ├── events/
│       │   │   ├── route.ts
│       │   │   └── [id]/
│       │   │       └── route.ts
│       │   └── ...
│       ├── organizer/       # API untuk organizer
│       │   └── ...
│       └── buyer/           # API untuk buyer
│           └── ...
├── server/
│   ├── api/                 # Business Logic (Tier 2)
│   │   ├── events.ts
│   │   ├── users.ts
│   │   └── ...
│   └── services/            # Services (Tier 3)
│       ├── event.service.ts
│       ├── user.service.ts
│       └── ...
```

## Tier 1: HTTP Routing

Tier 1 bertanggung jawab untuk:
- Menerima HTTP request
- Validasi input dasar
- Autentikasi dan otorisasi
- Memanggil business logic yang sesuai
- Mengembalikan HTTP response

### Contoh Route Handler

```typescript
// src/app/api/admin/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleGetEvents, handleCreateEvent } from "~/server/api/events";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { createEventSchema } from "~/lib/validations/event.schema";

/**
 * GET /api/admin/events
 * Mendapatkan semua event (admin view)
 */
export async function GET(request: NextRequest) {
  try {
    // Autentikasi dan otorisasi
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Hanya admin yang dapat mengakses endpoint ini
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Parsing query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Memanggil business logic
    const result = await handleGetEvents({ status, page, limit });

    // Mengembalikan response
    return NextResponse.json({
      success: true,
      data: result.events,
      meta: result.meta
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/events
 * Membuat event baru
 */
export async function POST(request: NextRequest) {
  try {
    // Autentikasi dan otorisasi
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Hanya admin yang dapat mengakses endpoint ini
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Parsing dan validasi body request
    const body = await request.json();
    
    try {
      const validatedData = createEventSchema.parse(body);
      
      // Memanggil business logic
      const event = await handleCreateEvent(validatedData, session.user.id);
      
      // Mengembalikan response
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

## Tier 2: Business Logic

Tier 2 bertanggung jawab untuk:
- Implementasi logika bisnis
- Validasi data yang lebih kompleks
- Orkestrasi panggilan ke services
- Transformasi data

### Contoh Business Logic

```typescript
// src/server/api/events.ts
import { eventService } from "~/server/services/event.service";
import { organizerService } from "~/server/services/organizer.service";
import { EventStatus } from "@prisma/client";
import { formatDate } from "~/lib/utils";

/**
 * Mendapatkan semua event dengan filter dan pagination
 */
export async function handleGetEvents({ 
  status, 
  page = 1, 
  limit = 10 
}: { 
  status?: string | null; 
  page?: number; 
  limit?: number; 
}) {
  // Validasi parameter
  const validStatus = status ? status as EventStatus : undefined;
  const validPage = Math.max(1, page);
  const validLimit = Math.min(50, Math.max(1, limit));
  
  // Memanggil service
  const { events, total } = await eventService.findEvents({
    status: validStatus,
    page: validPage,
    limit: validLimit,
    includeOrganizer: true
  });
  
  // Transformasi data
  const processedEvents = events.map(event => ({
    ...event,
    formattedDate: formatDate(event.date),
    organizerName: event.organizer?.name || "Unknown"
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

## Tier 3: Services

Tier 3 bertanggung jawab untuk:
- Interaksi dengan database
- Panggilan ke API eksternal
- Operasi CRUD dasar
- Caching (jika diperlukan)

### Contoh Service

```typescript
// src/server/services/event.service.ts
import { db } from "~/server/db";
import { EventStatus, Prisma } from "@prisma/client";

export const eventService = {
  /**
   * Mencari events dengan filter dan pagination
   */
  async findEvents({ 
    status, 
    page = 1, 
    limit = 10,
    includeOrganizer = false
  }: { 
    status?: EventStatus; 
    page?: number; 
    limit?: number;
    includeOrganizer?: boolean;
  }) {
    // Membuat filter
    const where: Prisma.EventWhereInput = {};
    
    if (status) {
      where.status = status;
    }
    
    // Menghitung total
    const total = await db.event.count({ where });
    
    // Query dengan pagination
    const events = await db.event.findMany({
      where,
      include: {
        organizer: includeOrganizer,
        ticketTypes: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });
    
    return { events, total };
  },
  
  /**
   * Mendapatkan event berdasarkan ID
   */
  async findById(id: string, includeRelations = false) {
    return db.event.findUnique({
      where: { id },
      include: {
        organizer: includeRelations,
        ticketTypes: includeRelations,
        approvals: includeRelations
      }
    });
  },
  
  /**
   * Membuat event baru
   */
  async createEvent(data) {
    return db.event.create({
      data,
      include: {
        organizer: true
      }
    });
  },
  
  /**
   * Mengupdate event
   */
  async updateEvent(id: string, data) {
    return db.event.update({
      where: { id },
      data,
      include: {
        organizer: true
      }
    });
  },
  
  /**
   * Menghapus event
   */
  async deleteEvent(id: string) {
    return db.event.delete({
      where: { id }
    });
  }
};
```

## Alur Request

Berikut adalah alur lengkap dari request client hingga response:

1. **Client mengirim HTTP request** ke endpoint API, misalnya `GET /api/admin/events`

2. **Route handler (Tier 1)** menerima request:
   - Melakukan autentikasi dan otorisasi
   - Memvalidasi parameter request
   - Memanggil business logic yang sesuai

3. **Business logic (Tier 2)** memproses request:
   - Melakukan validasi data yang lebih kompleks
   - Menerapkan aturan bisnis
   - Memanggil service yang sesuai

4. **Service (Tier 3)** berinteraksi dengan database:
   - Melakukan query ke database
   - Memformat data jika diperlukan
   - Mengembalikan hasil ke business logic

5. **Business logic** menerima data dari service:
   - Melakukan transformasi data jika diperlukan
   - Mengembalikan hasil ke route handler

6. **Route handler** menerima hasil dari business logic:
   - Memformat response sesuai standar API
   - Mengembalikan HTTP response ke client

7. **Client menerima HTTP response**

## Contoh Implementasi

### Contoh: Mendapatkan Detail Event

#### Route Handler (Tier 1)

```typescript
// src/app/api/admin/events/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleGetEventById } from "~/server/api/events";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Autentikasi dan otorisasi
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Hanya admin yang dapat mengakses endpoint ini
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Memanggil business logic
    const event = await handleGetEventById(id);

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Mengembalikan response
    return NextResponse.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error(`Error fetching event ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
```

#### Business Logic (Tier 2)

```typescript
// src/server/api/events.ts
import { eventService } from "~/server/services/event.service";
import { ticketService } from "~/server/services/ticket.service";

/**
 * Mendapatkan detail event berdasarkan ID
 */
export async function handleGetEventById(id: string) {
  // Mendapatkan event dari service
  const event = await eventService.findById(id, true);
  
  if (!event) {
    return null;
  }
  
  // Mendapatkan data tambahan
  const ticketsSold = await ticketService.countSoldTicketsByEventId(id);
  const revenue = await ticketService.calculateRevenueByEventId(id);
  
  // Menggabungkan data
  return {
    ...event,
    stats: {
      ticketsSold,
      revenue
    }
  };
}
```

#### Service (Tier 3)

```typescript
// src/server/services/ticket.service.ts
import { db } from "~/server/db";
import { TicketStatus } from "@prisma/client";

export const ticketService = {
  /**
   * Menghitung jumlah tiket terjual untuk event tertentu
   */
  async countSoldTicketsByEventId(eventId: string) {
    return db.ticket.count({
      where: {
        ticketType: {
          eventId
        },
        status: TicketStatus.SOLD
      }
    });
  },
  
  /**
   * Menghitung total pendapatan untuk event tertentu
   */
  async calculateRevenueByEventId(eventId: string) {
    const result = await db.ticket.aggregate({
      where: {
        ticketType: {
          eventId
        },
        status: TicketStatus.SOLD
      },
      _sum: {
        price: true
      }
    });
    
    return result._sum.price || 0;
  }
};
```

## Error Handling

Error handling dilakukan di setiap tier:

### Tier 1 (Route Handler)

```typescript
try {
  // Memanggil business logic
  const result = await handleSomeOperation();
  
  // Mengembalikan response sukses
  return NextResponse.json({
    success: true,
    data: result
  });
} catch (error) {
  // Log error
  console.error("Error:", error);
  
  // Mengembalikan response error
  return NextResponse.json(
    { success: false, error: "Operation failed" },
    { status: 500 }
  );
}
```

### Tier 2 (Business Logic)

```typescript
try {
  // Memanggil service
  const result = await someService.someOperation();
  
  // Memproses hasil
  return processResult(result);
} catch (error) {
  // Log error
  console.error("Business logic error:", error);
  
  // Re-throw error untuk ditangani oleh route handler
  throw error;
}
```

### Tier 3 (Service)

```typescript
try {
  // Melakukan operasi database
  const result = await db.someModel.someOperation();
  
  return result;
} catch (error) {
  // Log error
  console.error("Database error:", error);
  
  // Re-throw error untuk ditangani oleh business logic
  throw error;
}
```

## Autentikasi dan Otorisasi

Autentikasi dan otorisasi dilakukan di Tier 1 (Route Handler):

```typescript
// Autentikasi
const session = await auth();
if (!session?.user) {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}

// Otorisasi berdasarkan peran
if (session.user.role !== UserRole.ADMIN) {
  return NextResponse.json(
    { success: false, error: "Forbidden" },
    { status: 403 }
  );
}

// Otorisasi berdasarkan kepemilikan
if (resource.userId !== session.user.id) {
  return NextResponse.json(
    { success: false, error: "Forbidden" },
    { status: 403 }
  );
}
```

## Best Practices

1. **Separation of Concerns**
   - Tier 1: Fokus pada HTTP request/response
   - Tier 2: Fokus pada logika bisnis
   - Tier 3: Fokus pada akses data

2. **Validasi Input**
   - Gunakan Zod untuk validasi data
   - Validasi dasar di Tier 1
   - Validasi kompleks di Tier 2

3. **Error Handling**
   - Log error di setiap tier
   - Berikan pesan error yang informatif
   - Jangan ekspos detail error internal ke client

4. **Autentikasi dan Otorisasi**
   - Selalu periksa autentikasi di Tier 1
   - Periksa otorisasi berdasarkan peran dan kepemilikan
   - Gunakan middleware jika diperlukan

5. **Konsistensi Response**
   - Gunakan format response yang konsisten
   - Selalu sertakan flag `success`
   - Sertakan metadata jika diperlukan

6. **Logging**
   - Log request dan response di Tier 1
   - Log error di semua tier
   - Sertakan informasi kontekstual dalam log

7. **Testing**
   - Unit test untuk setiap tier
   - Integration test untuk alur lengkap
   - Mock dependencies untuk isolasi test
