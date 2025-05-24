/*
  Warnings:

  - You are about to drop the column `userId` on the `TicketReservation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TicketReservation" DROP CONSTRAINT "TicketReservation_userId_fkey";

-- DropIndex
DROP INDEX "TicketReservation_userId_idx";

-- AlterTable
ALTER TABLE "TicketReservation" DROP COLUMN "userId";
