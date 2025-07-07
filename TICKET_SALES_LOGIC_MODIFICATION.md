# Ticket Sales Logic Modification

## Overview
Modified the VBTix ticket sales system so that tickets are only counted as "sold" after admin approval, not immediately upon purchase. This ensures better inventory control and prevents premature sales counting.

## Key Changes Made

### 1. Database Schema Changes
- **Added PENDING status** to `TicketStatus` enum in `prisma/schema.prisma`
- **New enum values**: `PENDING`, `ACTIVE`, `USED`, `CANCELLED`, `EXPIRED`, `REFUNDED`
- **Migration applied** using `npx prisma db push`

### 2. Purchase Logic Modifications

#### File: `src/server/api/buyer-tickets.ts`
- **Modified `handlePurchaseFromReservation`**: 
  - Tickets now created with `PENDING` status instead of `ACTIVE`
  - **Removed immediate `sold` count increment**
  - Reserved count maintained to prevent overselling during pending verification
  
- **Modified `handleBulkPurchaseTickets`**:
  - **Removed immediate `sold` count increment**
  - Tickets created with `PENDING` status

#### Key Code Changes:
```typescript
// OLD: Immediate sold count increment
sold: {
  increment: reservation.quantity,
}

// NEW: No sold count increment, maintain reservation
// Do NOT increment sold count yet - this will happen on admin approval
// Keep reserved count to prevent overselling during pending verification
```

### 3. Admin Approval Logic

#### File: `src/server/api/admin-orders.ts`
- **Enhanced `handleUpdateOrderStatus`** function:
  - **On SUCCESS**: Increment sold count, activate tickets, generate QR codes
  - **On FAILED**: Cancel tickets, restore inventory, no sold count change

#### Key Implementation:
```typescript
// On approval (SUCCESS)
await tx.ticketType.update({
  where: { id: item.ticketTypeId },
  data: {
    sold: {
      increment: item.quantity, // ✅ NOW increments sold count
    },
    reserved: {
      decrement: item.quantity, // Restore reserved inventory
    },
  },
});

// On rejection (FAILED)
await tx.ticket.updateMany({
  where: { transactionId: order.id, status: { in: ["PENDING", "ACTIVE"] }},
  data: { status: "CANCELLED" },
});
```

### 4. Inventory Management Updates

#### Files Modified:
- `src/server/api/inventory.ts`
- `src/server/services/reservation.service.ts`
- `src/server/api/tickets.ts`
- `src/server/services/ticket.service.ts`

#### Key Changes:
- **Availability calculation** now accounts for pending tickets
- **Formula**: `Available = Total - Sold - Reserved - Pending`
- **Sold count** only includes `ACTIVE` and `USED` tickets
- **Pending tickets** tracked separately to prevent overselling

### 5. Order Expiration Service

#### File: `src/server/services/order-expiration.service.ts`
- Updated to handle both legacy orders (with sold count) and new orders (without sold count)
- Properly decrements both `sold` and `reserved` counts for backward compatibility

## New Flow Summary

### Before (Old Flow):
1. Customer purchases → `sold` count increments immediately
2. Admin approves → QR codes generated, emails sent
3. Admin rejects → `sold` count decremented

### After (New Flow):
1. Customer purchases → Tickets created with `PENDING` status, **no sold count increment**
2. Admin approves → `sold` count increments, tickets become `ACTIVE`, QR codes generated
3. Admin rejects → Tickets become `CANCELLED`, inventory restored, **no sold count change**

## Benefits

1. **Accurate Sales Reporting**: Sold count only reflects admin-approved sales
2. **Better Inventory Control**: Prevents overselling while maintaining reservation system
3. **Clear Status Tracking**: PENDING → ACTIVE/CANCELLED flow is transparent
4. **Backward Compatibility**: Existing orders continue to work
5. **Proper Audit Trail**: Clear distinction between purchased and sold tickets

## Testing

Created comprehensive test script (`dev/test-ticket-sales-flow.ts`) that verifies:
- ✅ Tickets created with PENDING status on purchase
- ✅ Sold count does NOT increase on purchase
- ✅ Sold count increases only on admin approval
- ✅ Sold count unchanged on admin rejection
- ✅ Inventory management works correctly

## Files Modified

1. `prisma/schema.prisma` - Added PENDING status
2. `src/server/api/buyer-tickets.ts` - Modified purchase logic
3. `src/server/api/admin-orders.ts` - Enhanced approval/rejection logic
4. `src/server/api/inventory.ts` - Updated inventory calculations
5. `src/server/services/reservation.service.ts` - Added pending ticket accounting
6. `src/server/api/tickets.ts` - Updated ticket counting logic
7. `src/server/services/ticket.service.ts` - Updated sold ticket counting
8. `src/server/services/order-expiration.service.ts` - Backward compatibility

## Migration Required

- Database schema updated with `npx prisma db push`
- Prisma client regenerated with updated types
- All existing tickets remain unaffected (ACTIVE status preserved)

## Impact

- **Manual Payment Methods**: Now properly require admin approval before counting as sold
- **QRIS Payments**: Also require admin verification before sold count increment
- **Inventory**: More accurate availability calculations
- **Reports**: Sales reports now reflect only admin-approved transactions
- **User Experience**: No change for customers, improved control for admins
