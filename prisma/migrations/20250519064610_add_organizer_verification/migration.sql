/*
  Warnings:

  - You are about to drop the column `verificationDocs` on the `Organizer` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Organizer" DROP COLUMN "verificationDocs";

-- CreateTable
CREATE TABLE "OrganizerVerification" (
    "id" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "ktpNumber" TEXT,
    "ktpName" TEXT,
    "ktpAddress" TEXT,
    "ktpImageUrl" TEXT,
    "ktpImagePublicId" TEXT,
    "npwpNumber" TEXT,
    "npwpName" TEXT,
    "npwpAddress" TEXT,
    "npwpImageUrl" TEXT,
    "npwpImagePublicId" TEXT,
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "termsAcceptedAt" TIMESTAMP(3),
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizerVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizerVerification_organizerId_key" ON "OrganizerVerification"("organizerId");

-- AddForeignKey
ALTER TABLE "OrganizerVerification" ADD CONSTRAINT "OrganizerVerification_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
