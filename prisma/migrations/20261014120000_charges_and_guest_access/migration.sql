-- CreateEnum
CREATE TYPE "ChargeCategory" AS ENUM ('GROCERIES', 'ALCOHOL', 'SERVICE', 'EXTRA');

-- AlterTable
ALTER TABLE "Guest" ADD COLUMN     "portalAccess" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "BookingCharge" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "category" "ChargeCategory" NOT NULL DEFAULT 'EXTRA',
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "incurredOn" DATE,
    "documentId" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingCharge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingCharge_documentId_key" ON "BookingCharge"("documentId");

-- CreateIndex
CREATE INDEX "BookingCharge_bookingId_idx" ON "BookingCharge"("bookingId");

-- AddForeignKey
ALTER TABLE "BookingCharge" ADD CONSTRAINT "BookingCharge_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingCharge" ADD CONSTRAINT "BookingCharge_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

