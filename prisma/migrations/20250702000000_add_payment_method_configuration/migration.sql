-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketTypePaymentMethod" (
    "id" TEXT NOT NULL,
    "ticketTypeId" TEXT NOT NULL,
    "paymentMethodId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketTypePaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_code_key" ON "PaymentMethod"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TicketTypePaymentMethod_ticketTypeId_paymentMethodId_key" ON "TicketTypePaymentMethod"("ticketTypeId", "paymentMethodId");

-- AddForeignKey
ALTER TABLE "TicketTypePaymentMethod" ADD CONSTRAINT "TicketTypePaymentMethod_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketTypePaymentMethod" ADD CONSTRAINT "TicketTypePaymentMethod_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert default payment methods
INSERT INTO "PaymentMethod" ("id", "code", "name", "description", "isActive", "updatedAt") VALUES
('pm_manual_payment', 'MANUAL_PAYMENT', 'Pembayaran Manual', 'Pembayaran akan dikonfirmasi manual oleh admin', true, CURRENT_TIMESTAMP),
('pm_qris_by_wonders', 'QRIS_BY_WONDERS', 'Wondr by BNI', 'Scan QR code untuk pembayaran dengan QRIS', true, CURRENT_TIMESTAMP);

-- For backward compatibility, add all payment methods to existing ticket types
-- This ensures existing ticket types continue to work with all payment methods
INSERT INTO "TicketTypePaymentMethod" ("id", "ticketTypeId", "paymentMethodId")
SELECT 
    'ttpm_' || "TicketType"."id" || '_' || "PaymentMethod"."id",
    "TicketType"."id",
    "PaymentMethod"."id"
FROM "TicketType"
CROSS JOIN "PaymentMethod"
WHERE "PaymentMethod"."isActive" = true;
