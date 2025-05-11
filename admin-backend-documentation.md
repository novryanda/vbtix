# Dokumentasi Backend Admin

Dokumen ini menjelaskan komponen-komponen backend yang diperlukan untuk mengimplementasikan fungsionalitas admin dalam aplikasi penjualan tiket konser VBTix.

## Daftar Isi

- [Arsitektur API](#arsitektur-api)
- [API Routes (Tier 1)](#api-routes-tier-1)
- [Business Logic (Tier 2)](#business-logic-tier-2)
- [Service Layer (Tier 3)](#service-layer-tier-3)
- [Alur Data](#alur-data)
- [Implementasi](#implementasi)

## Arsitektur API

Aplikasi ini menggunakan arsitektur API 3-tier:

1. **Tier 1: HTTP Routing** - Menangani HTTP request/response (`/src/app/api/`)
2. **Tier 2: Business Logic** - Menangani logika bisnis (`/src/server/api/`)
3. **Tier 3: Service Layer** - Berinteraksi dengan database (`/src/server/services/`)

## API Routes (Tier 1)

### 1. Dashboard Admin

```
GET /api/admin/dashboard
```

Mengembalikan statistik dan data untuk dashboard admin.

### 2. Manajemen Event

```
GET    /api/admin/events                 # Mendapatkan daftar semua event
POST   /api/admin/events                 # Membuat event baru
GET    /api/admin/events/[id]            # Mendapatkan detail event
PUT    /api/admin/events/[id]            # Memperbarui event
DELETE /api/admin/events/[id]            # Menghapus event
POST   /api/admin/events/[id]/featured   # Mengatur event sebagai featured
GET    /api/admin/events/[id]/statistics # Mendapatkan statistik event
POST   /api/admin/events/[id]/review     # Menyetujui atau menolak event
```

### 3. Manajemen User

```
GET    /api/admin/users          # Mendapatkan daftar semua user
GET    /api/admin/users/[id]     # Mendapatkan detail user
PUT    /api/admin/users/[id]     # Memperbarui user
DELETE /api/admin/users/[id]     # Menghapus user
PUT    /api/admin/users/[id]/role # Mengubah peran user
```

### 4. Manajemen Organizer

```
GET    /api/admin/organizers           # Mendapatkan daftar semua organizer
GET    /api/admin/organizers/[id]      # Mendapatkan detail organizer
PUT    /api/admin/organizers/[id]      # Memperbarui organizer
DELETE /api/admin/organizers/[id]      # Menghapus organizer
POST   /api/admin/organizers/[id]/verify # Memverifikasi organizer
```

### 5. Manajemen Order

```
GET    /api/admin/orders           # Mendapatkan daftar semua order
GET    /api/admin/orders/[id]      # Mendapatkan detail order
PUT    /api/admin/orders/[id]/status # Mengubah status order
```

### 6. Laporan dan Analitik

```
GET    /api/admin/reports/sales    # Mendapatkan laporan penjualan
GET    /api/admin/reports/users    # Mendapatkan laporan user
GET    /api/admin/reports/events   # Mendapatkan laporan event
```

## Business Logic (Tier 2)

Business logic layer berisi handler functions yang dipanggil oleh API routes. Berikut adalah handler yang diperlukan untuk fungsionalitas admin:

### 1. Event Handlers (`/src/server/api/events.ts`)

```typescript
// Mendapatkan daftar event dengan filter
export async function handleGetEvents(params: {
  status?: EventStatus;
  page?: number;
  limit?: number;
  search?: string;
}) {
  // Implementasi
}

// Mendapatkan detail event berdasarkan ID
export async function handleGetEventById(id: string) {
  // Implementasi
}

// Memperbarui event
export async function handleUpdateEvent(id: string, data: UpdateEventInput) {
  // Implementasi
}

// Menghapus event
export async function handleDeleteEvent(id: string) {
  // Implementasi
}

// Mengatur event sebagai featured
export async function handleSetEventFeatured(id: string, featured: boolean) {
  // Implementasi
}

// Mendapatkan statistik event
export async function handleGetEventStatistics(id: string) {
  // Implementasi
}

// Menyetujui atau menolak event
export async function handleReviewEvent(id: string, status: ApprovalStatus, feedback?: string) {
  // Implementasi
}
```

### 2. User Handlers (`/src/server/api/users.ts`)

```typescript
// Mendapatkan daftar user dengan filter
export async function handleGetUsers(params: {
  role?: UserRole;
  page?: number;
  limit?: number;
  search?: string;
}) {
  // Implementasi
}

// Mendapatkan detail user berdasarkan ID
export async function handleGetUserById(id: string) {
  // Implementasi
}

// Memperbarui user
export async function handleUpdateUser(id: string, data: UpdateUserInput) {
  // Implementasi
}

// Menghapus user
export async function handleDeleteUser(id: string) {
  // Implementasi
}

// Mengubah peran user
export async function handleChangeUserRole(id: string, role: UserRole) {
  // Implementasi
}
```

### 3. Organizer Handlers (`/src/server/api/organizers.ts`)

```typescript
// Mendapatkan daftar organizer
export async function handleGetOrganizers(params: {
  verified?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}) {
  // Implementasi
}

// Mendapatkan detail organizer berdasarkan ID
export async function handleGetOrganizerById(id: string) {
  // Implementasi
}

// Memverifikasi organizer
export async function handleVerifyOrganizer(id: string, verified: boolean, feedback?: string) {
  // Implementasi
}
```

### 4. Order Handlers (`/src/server/api/orders.ts`)

```typescript
// Mendapatkan daftar order
export async function handleGetOrders(params: {
  status?: OrderStatus;
  page?: number;
  limit?: number;
  search?: string;
}) {
  // Implementasi
}

// Mendapatkan detail order berdasarkan ID
export async function handleGetOrderById(id: string) {
  // Implementasi
}

// Mengubah status order
export async function handleUpdateOrderStatus(id: string, status: OrderStatus) {
  // Implementasi
}
```

### 5. Report Handlers (`/src/server/api/reports.ts`)

```typescript
// Mendapatkan laporan penjualan
export async function handleGetSalesReport(params: {
  startDate?: Date;
  endDate?: Date;
  eventId?: string;
}) {
  // Implementasi
}

// Mendapatkan laporan user
export async function handleGetUserReport(params: {
  startDate?: Date;
  endDate?: Date;
  role?: UserRole;
}) {
  // Implementasi
}

// Mendapatkan laporan event
export async function handleGetEventReport(params: {
  startDate?: Date;
  endDate?: Date;
  status?: EventStatus;
}) {
  // Implementasi
}
```

## Service Layer (Tier 3)

Service layer berinteraksi langsung dengan database dan menyediakan fungsi-fungsi yang digunakan oleh business logic layer.

### 1. Dashboard Service (`/src/server/services/dashboard.service.ts`)

```typescript
// Mendapatkan statistik dashboard admin
export async function getAdminDashboardStats() {
  // Implementasi
}

// Mendapatkan event terbaru
export async function getRecentEvents(limit = 5) {
  // Implementasi
}

// Mendapatkan organizer terbaru
export async function getRecentOrganizers(limit = 5) {
  // Implementasi
}

// Mendapatkan user terbaru
export async function getRecentUsers(limit = 5) {
  // Implementasi
}

// Mendapatkan overview penjualan
export async function getSalesOverview() {
  // Implementasi
}
```

### 2. Event Service (`/src/server/services/event.service.ts`)

```typescript
export const eventService = {
  // Mencari event dengan filter
  async findEvents(params: {
    status?: EventStatus;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    // Implementasi
  },

  // Mencari event berdasarkan ID
  async findById(id: string) {
    // Implementasi
  },

  // Membuat event baru
  async createEvent(data: Prisma.EventCreateInput) {
    // Implementasi
  },

  // Memperbarui event
  async updateEvent(id: string, data: Prisma.EventUpdateInput) {
    // Implementasi
  },

  // Menghapus event
  async deleteEvent(id: string) {
    // Implementasi
  },

  // Mengatur event sebagai featured
  async setFeatured(id: string, featured: boolean) {
    // Implementasi
  },

  // Mendapatkan statistik event
  async getStatistics(id: string) {
    // Implementasi
  },

  // Menyetujui atau menolak event
  async reviewEvent(id: string, status: ApprovalStatus, feedback?: string) {
    // Implementasi
  }
};
```

### 3. User Service (`/src/server/services/user.service.ts`)

```typescript
export const userService = {
  // Mencari semua user dengan filter
  async findAll(params: {
    role?: UserRole;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    // Implementasi
  },

  // Mencari user berdasarkan ID
  async findById(id: string) {
    // Implementasi
  },

  // Membuat user baru
  async createUser(data: Prisma.UserCreateInput) {
    // Implementasi
  },

  // Memperbarui user
  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    // Implementasi
  },

  // Menghapus user
  async deleteUser(id: string) {
    // Implementasi
  },

  // Mengubah peran user
  async changeRole(id: string, role: UserRole) {
    // Implementasi
  }
};
```

### 4. Organizer Service (`/src/server/services/organizer.service.ts`)

```typescript
export const organizerService = {
  // Mencari semua organizer
  async findAll(params: {
    verified?: boolean;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    // Implementasi
  },

  // Mencari organizer berdasarkan ID
  async findById(id: string) {
    // Implementasi
  },

  // Mencari organizer berdasarkan user ID
  async findByUserId(userId: string) {
    // Implementasi
  },

  // Memverifikasi organizer
  async verifyOrganizer(id: string, verified: boolean, feedback?: string) {
    // Implementasi
  }
};
```

### 5. Order Service (`/src/server/services/order.service.ts`)

```typescript
export const orderService = {
  // Mencari semua order dengan filter
  async findAll(params: {
    status?: OrderStatus;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    // Implementasi
  },

  // Mencari order berdasarkan ID
  async findById(id: string) {
    // Implementasi
  },

  // Mengubah status order
  async updateStatus(id: string, status: OrderStatus) {
    // Implementasi
  }
};
```

### 6. Report Service (`/src/server/services/report.service.ts`)

```typescript
export const reportService = {
  // Menghasilkan laporan penjualan
  async generateSalesReport(params: {
    startDate?: Date;
    endDate?: Date;
    eventId?: string;
  }) {
    // Implementasi
  },

  // Menghasilkan laporan user
  async generateUserReport(params: {
    startDate?: Date;
    endDate?: Date;
    role?: UserRole;
  }) {
    // Implementasi
  },

  // Menghasilkan laporan event
  async generateEventReport(params: {
    startDate?: Date;
    endDate?: Date;
    status?: EventStatus;
  }) {
    // Implementasi
  }
};
```

### 7. Approval Service (`/src/server/services/approval.service.ts`)

```typescript
export const approvalService = {
  // Mencari approval yang pending
  async findPendingApprovals(type: ApprovalType) {
    // Implementasi
  },

  // Menyetujui item (event, organizer)
  async approveItem(id: string, type: ApprovalType, userId: string, feedback?: string) {
    // Implementasi
  },

  // Menolak item (event, organizer)
  async rejectItem(id: string, type: ApprovalType, userId: string, feedback?: string) {
    // Implementasi
  },

  // Menambahkan feedback pada approval
  async addFeedback(id: string, feedback: string) {
    // Implementasi
  }
};
```

## Alur Data

Berikut adalah alur data untuk operasi admin:

1. **Frontend** - Komponen React menggunakan SWR hooks untuk mengambil data dari API
2. **API Routes** - Menerima HTTP request, melakukan validasi dan autentikasi
3. **Business Logic** - Menangani logika bisnis dan memanggil service yang sesuai
4. **Service Layer** - Berinteraksi dengan database melalui Prisma
5. **Database** - Menyimpan dan mengambil data

Contoh alur untuk mendapatkan daftar event:

```
Frontend (useAdminEvents hook)
  → GET /api/admin/events
  → handleGetEvents
  → eventService.findEvents
  → Database (Prisma)
  → Response kembali melalui jalur yang sama
```

## Implementasi

Untuk mengimplementasikan backend admin, ikuti langkah-langkah berikut:

1. Buat service layer terlebih dahulu (Tier 3)
2. Implementasikan business logic (Tier 2)
3. Buat API routes (Tier 1)
4. Buat hooks SWR untuk frontend

Prioritaskan implementasi fitur-fitur berikut:

1. Dashboard admin (statistik dan overview)
2. Manajemen event (CRUD dan approval)
3. Manajemen user dan organizer
4. Manajemen order
5. Laporan dan analitik
