# Ticket Reservation System API Documentation

## Overview

The ticket reservation system implements a time-limited booking flow where buyers can reserve tickets for a specified duration (default: 10 minutes) before completing their purchase.

## Database Schema

### TicketReservation Model

- `id`: Unique identifier
- `sessionId`: For guest tracking (required)
- `ticketTypeId`: Links to TicketType
- `quantity`: Number of tickets reserved
- `reservedAt`: Timestamp when reserved
- `expiresAt`: When reservation expires
- `status`: ReservationStatus (ACTIVE, EXPIRED, CONVERTED, CANCELLED)
- `metadata`: JSON field for additional data

### TicketType Model Updates

- Added `reserved` field to track currently reserved tickets

## API Endpoints

### 1. Create Reservation

**POST** `/api/public/reservations`

Creates a new ticket reservation.

**Request Body:**

```json
{
  "ticketTypeId": "string",
  "quantity": number,
  "sessionId": "string",
  "expirationMinutes": number (optional, default: 10)
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "reservation": {
      "id": "string",
      "ticketTypeId": "string",
      "quantity": number,
      "expiresAt": "datetime",
      "status": "ACTIVE",
      "ticketType": {
        "id": "string",
        "name": "string",
        "price": number,
        "event": {
          "id": "string",
          "title": "string",
          "venue": "string",
          "startDate": "datetime"
        }
      }
    },
    "expiresAt": "datetime",
    "remainingSeconds": number
  },
  "message": "Reservation created successfully"
}
```

### 2. Bulk Create Reservations

**POST** `/api/public/reservations`

Creates multiple reservations at once.

**Request Body:**

```json
{
  "reservations": [
    {
      "ticketTypeId": "string",
      "quantity": number
    }
  ],
  "sessionId": "string",
  "expirationMinutes": number (optional, default: 10)
}
```

### 3. Get Active Reservations

**GET** `/api/public/reservations?sessionId=string&page=1&limit=10`

Retrieves active reservations for a user or session.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "quantity": number,
      "expiresAt": "datetime",
      "remainingSeconds": number,
      "isExpired": boolean,
      "ticketType": {
        "name": "string",
        "price": number,
        "event": {
          "title": "string",
          "venue": "string"
        }
      }
    }
  ],
  "meta": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

### 4. Get Specific Reservation

**GET** `/api/public/reservations/[reservationId]?sessionId=string`

Retrieves a specific reservation by ID.

### 5. Cancel Reservation

**DELETE** `/api/public/reservations/[reservationId]`

Cancels an active reservation.

**Request Body:**

```json
{
  "sessionId": "string"
}
```

### 6. Extend Reservation

**PATCH** `/api/public/reservations/[reservationId]`

Extends the expiration time of a reservation.

**Request Body:**

```json
{
  "additionalMinutes": number,
  "sessionId": "string"
}
```

### 7. Purchase from Reservation

**POST** `/api/public/reservations/[reservationId]/purchase`

Converts a reservation into an actual ticket purchase.

**Request Body:**

```json
{
  "sessionId": "string",
  "buyerInfo": {
    "fullName": "string",
    "identityType": "string",
    "identityNumber": "string",
    "email": "string",
    "whatsapp": "string"
  },
  "ticketHolders": [
    {
      "fullName": "string",
      "identityType": "string",
      "identityNumber": "string",
      "email": "string",
      "whatsapp": "string"
    }
  ]
}
```

### 8. Check Ticket Availability

**GET** `/api/public/availability/[ticketTypeId]`

Checks real-time availability for a ticket type.

**Response:**

```json
{
  "success": true,
  "data": {
    "total": number,
    "sold": number,
    "reserved": number,
    "available": number
  }
}
```

### 9. Admin: Cleanup Expired Reservations

**POST** `/api/admin/reservations/cleanup`

Manually triggers cleanup of expired reservations (Admin only).

### 10. Admin: Get Cleanup Statistics

**GET** `/api/admin/reservations/cleanup`

Gets reservation statistics (Admin only).

### 11. Cron: Automated Cleanup

**GET** `/api/cron/cleanup-reservations`

Automated endpoint for cleaning up expired reservations.

## Flow Implementation

### 1. Ticket Selection & Reservation

1. User selects tickets on event page
2. System calls `POST /api/public/reservations` to reserve tickets
3. Tickets are temporarily removed from available inventory
4. User gets 10-minute timer to complete purchase

### 2. Information Input

1. User fills in buyer information and ticket holder details
2. System validates all required fields
3. If completed within time limit, proceed to purchase

### 3. Purchase Conversion

1. System calls `POST /api/public/reservations/[id]/purchase`
2. Reservation is converted to actual transaction
3. Individual tickets are created with QR codes
4. Reserved count is decremented, sold count is incremented

### 4. Expiration Handling

1. Background cron job runs every 5 minutes
2. Expired reservations are automatically cancelled
3. Reserved tickets are released back to inventory

## Error Handling

- **404**: Reservation/Ticket type not found
- **409**: Conflict (not enough tickets, already reserved, expired)
- **403**: Permission denied
- **400**: Validation errors
- **500**: Server errors

## Security Considerations

1. **Session-based tracking** for guest users
2. **User authentication** required for purchases
3. **Ownership validation** for all reservation operations
4. **Rate limiting** should be implemented
5. **Cron endpoint protection** with secret token

## Utility Functions

- `generateSessionId()`: Creates unique session IDs for guests
- `generateReservationCode()`: Creates human-readable reservation codes
- `generateUniqueCode()`: Creates QR codes for tickets

## Next Steps

1. Implement frontend components for reservation flow
2. Add real-time countdown timers
3. Implement WebSocket notifications for expiration warnings
4. Add reservation analytics and reporting
5. Implement reservation extension policies
6. Add email notifications for reservation status changes
