-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "reservationId" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "reservationId" TEXT;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "TicketReservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "TicketReservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
