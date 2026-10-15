-- CreateEnum
CREATE TYPE "PaymentKind" AS ENUM ('PAYMENT', 'SETTLED_OUTSIDE');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "commissionPercent" DECIMAL(5,2);

-- AlterTable
ALTER TABLE "ServiceRequest" ADD COLUMN     "vendorCost" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "BookingCharge" ADD COLUMN     "cost" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "BookingPayment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "kind" "PaymentKind" NOT NULL DEFAULT 'PAYMENT',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "receivedOn" DATE,
    "method" TEXT,
    "note" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingPayment_bookingId_idx" ON "BookingPayment"("bookingId");

-- AddForeignKey
ALTER TABLE "BookingPayment" ADD CONSTRAINT "BookingPayment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

