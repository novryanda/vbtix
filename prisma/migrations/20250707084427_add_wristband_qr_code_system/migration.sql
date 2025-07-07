-- CreateEnum
CREATE TYPE "WristbandQRCodeStatus" AS ENUM ('PENDING', 'GENERATED', 'ACTIVE', 'EXPIRED', 'REVOKED');

-- AlterEnum
ALTER TYPE "TicketStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "Ticket" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "WristbandQRCode" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "qrCode" TEXT NOT NULL,
    "qrCodeImageUrl" TEXT,
    "qrCodeData" TEXT,
    "qrCodeGeneratedAt" TIMESTAMP(3),
    "status" "WristbandQRCodeStatus" NOT NULL DEFAULT 'PENDING',
    "isReusable" BOOLEAN NOT NULL DEFAULT true,
    "maxScans" INTEGER,
    "scanCount" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "WristbandQRCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WristbandScanLog" (
    "id" TEXT NOT NULL,
    "wristbandQRId" TEXT NOT NULL,
    "scannedBy" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scanResult" TEXT NOT NULL,
    "scanLocation" TEXT,
    "scanDevice" TEXT,
    "notes" TEXT,

    CONSTRAINT "WristbandScanLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WristbandQRCode_qrCode_key" ON "WristbandQRCode"("qrCode");

-- CreateIndex
CREATE INDEX "WristbandQRCode_eventId_idx" ON "WristbandQRCode"("eventId");

-- CreateIndex
CREATE INDEX "WristbandQRCode_organizerId_idx" ON "WristbandQRCode"("organizerId");

-- CreateIndex
CREATE INDEX "WristbandQRCode_status_idx" ON "WristbandQRCode"("status");

-- CreateIndex
CREATE INDEX "WristbandScanLog_wristbandQRId_idx" ON "WristbandScanLog"("wristbandQRId");

-- CreateIndex
CREATE INDEX "WristbandScanLog_scannedAt_idx" ON "WristbandScanLog"("scannedAt");

-- AddForeignKey
ALTER TABLE "WristbandQRCode" ADD CONSTRAINT "WristbandQRCode_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WristbandQRCode" ADD CONSTRAINT "WristbandQRCode_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WristbandScanLog" ADD CONSTRAINT "WristbandScanLog_wristbandQRId_fkey" FOREIGN KEY ("wristbandQRId") REFERENCES "WristbandQRCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
