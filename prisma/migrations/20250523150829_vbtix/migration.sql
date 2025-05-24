/*
  Warnings:

  - You are about to drop the column `reservationId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `reservationId` on the `Payment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_reservationId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_reservationId_fkey";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "reservationId";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "reservationId";
