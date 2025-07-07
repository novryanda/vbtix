# Manual Ticket Integration

## Overview
This document describes the implementation of manual ticket creation functionality for organizers, allowing them to create tickets that are immediately counted as sold and displayed in dashboard statistics.

## Key Features

### 1. Immediate Sales Counting
- **Manual tickets with SUCCESS payment status** are created with `ACTIVE` status instead of `PENDING`
- **Sold count is incremented immediately** during ticket creation transaction
- **No admin approval required** for manual ticket sales counting

### 2. Dashboard Integration
- Manual tickets appear in **organizer dashboard statistics**
- Included in **total revenue calculations**
- Counted in **ticket sales metrics**
- Displayed in **ticket status breakdowns**

### 3. QR Code Generation
- **Automatic QR code generation** for SUCCESS payment status orders
- **Immediate availability** for manual tickets
- **Same security and validation** as regular tickets

## Implementation Details

### API Endpoint
```
POST /api/organizer/[id]/orders/create
```

### Key Logic Changes

#### 1. Ticket Status Assignment
```typescript
// Determine ticket status based on payment status
const ticketStatus = orderData.paymentStatus === "SUCCESS" 
  ? TicketStatus.ACTIVE    // Immediate active status for manual sales
  : TicketStatus.PENDING;  // Pending for other payment statuses
```

#### 2. Sold Count Increment
```typescript
// For manual tickets with SUCCESS payment status, immediately increment sold count
if (orderData.paymentStatus === "SUCCESS") {
  for (const item of orderData.orderItems) {
    await tx.ticketType.update({
      where: { id: item.ticketTypeId },
      data: {
        sold: {
          increment: item.quantity,
        },
      },
    });
  }
}
```

#### 3. Inventory Validation
```typescript
// Validate ticket availability for SUCCESS payments (immediate sales)
if (orderData.paymentStatus === "SUCCESS") {
  for (const item of orderData.orderItems) {
    const available = ticketType.quantity - ticketType.sold - ticketType.reserved;
    if (available < item.quantity) {
      throw new Error(`Insufficient tickets available`);
    }
  }
}
```

### Dashboard Statistics

#### Sales Counting Logic
All dashboard statistics already properly count `ACTIVE` tickets as sold:

```typescript
// Total tickets sold (includes manual ACTIVE tickets)
prisma.ticket.count({
  where: {
    status: {
      in: ["ACTIVE", "USED"], // Manual tickets included
    },
  },
})

// Revenue calculation (includes SUCCESS transactions)
prisma.orderItem.aggregate({
  where: {
    order: {
      status: "SUCCESS", // Manual orders included
    },
  },
  _sum: { price: true },
})
```

## Usage Flow

### 1. Organizer Creates Manual Order
1. Navigate to organizer dashboard
2. Go to "Create Order" page
3. Fill in customer information
4. Select ticket types and quantities
5. Set payment method to "MANUAL"
6. **Set payment status to "SUCCESS"** for immediate sales
7. Submit order

### 2. System Processing
1. **Validates ticket availability** (for SUCCESS payments)
2. **Creates transaction** with SUCCESS status
3. **Creates tickets** with ACTIVE status
4. **Increments sold count** immediately
5. **Generates QR codes** automatically
6. **Sends email** with tickets (if SUCCESS)

### 3. Dashboard Updates
1. **Total sold tickets** increases immediately
2. **Revenue** is updated in real-time
3. **Ticket status** shows as ACTIVE
4. **Statistics** reflect the manual sales

## Payment Status Options

### SUCCESS (Recommended for Manual Sales)
- ✅ Creates ACTIVE tickets immediately
- ✅ Increments sold count
- ✅ Generates QR codes
- ✅ Sends email notifications
- ✅ Counts in dashboard statistics

### PENDING (For Unverified Payments)
- ⏳ Creates PENDING tickets
- ⏳ Requires admin/organizer approval
- ⏳ No immediate sold count increment
- ⏳ No QR codes until approval

## Testing

### Automated Test
Run the integration test to verify functionality:

```bash
# Make the test script executable
chmod +x dev/run-manual-ticket-test.sh

# Run the test
./dev/run-manual-ticket-test.sh
```

### Manual Testing Steps
1. **Create manual order** with SUCCESS payment status
2. **Verify ticket creation** with ACTIVE status
3. **Check sold count increment** in ticket type
4. **Confirm dashboard statistics** update
5. **Test QR code generation** functionality
6. **Validate email delivery** (if configured)

## Benefits

### For Organizers
- **Immediate sales tracking** for walk-in customers
- **Real-time dashboard updates** for manual sales
- **No waiting for approval** for direct sales
- **Complete ticket management** in one interface

### For System
- **Consistent data flow** with existing architecture
- **Proper inventory management** with validation
- **Unified statistics calculation** across all ticket types
- **Seamless integration** with existing features

## Security Considerations

### Validation
- ✅ **Ticket availability** checked before creation
- ✅ **Organizer ownership** verified for events
- ✅ **Authentication** required for access
- ✅ **Input validation** using Zod schemas

### Audit Trail
- ✅ **Transaction records** for all manual sales
- ✅ **Buyer information** stored securely
- ✅ **QR code tracking** for validation
- ✅ **Email delivery** confirmation

## Troubleshooting

### Common Issues

#### 1. Tickets Not Counted as Sold
- **Check payment status**: Must be "SUCCESS" for immediate counting
- **Verify ticket status**: Should be "ACTIVE" not "PENDING"
- **Confirm sold count**: Should increment in TicketType table

#### 2. Dashboard Not Updating
- **Refresh dashboard**: Statistics may need page refresh
- **Check API calls**: Verify organizer statistics endpoint
- **Validate data**: Ensure ACTIVE tickets are being counted

#### 3. QR Codes Not Generated
- **Check payment status**: Must be "SUCCESS" for QR generation
- **Verify transaction**: Should have SUCCESS status
- **Check logs**: Look for QR generation errors

### Support
For issues or questions about manual ticket integration, check:
1. **Application logs** for error messages
2. **Database records** for ticket status
3. **API responses** for validation errors
4. **Test script results** for functionality verification
