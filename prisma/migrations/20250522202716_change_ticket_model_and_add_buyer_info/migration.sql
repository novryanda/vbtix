/*
  Warnings:

  - You are about to drop the `ETicket` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ETicket" DROP CONSTRAINT "ETicket_orderId_fkey";

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "delivered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "filePublicId" TEXT,
ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "scannedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "ETicket";

-- CreateTable
CREATE TABLE "BuyerInfo" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "identityType" TEXT NOT NULL,
    "identityNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuyerInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketHolder" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "identityType" TEXT NOT NULL,
    "identityNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketHolder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BuyerInfo_transactionId_key" ON "BuyerInfo"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "TicketHolder_ticketId_key" ON "TicketHolder"("ticketId");

-- AddForeignKey
ALTER TABLE "BuyerInfo" ADD CONSTRAINT "BuyerInfo_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketHolder" ADD CONSTRAINT "TicketHolder_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
