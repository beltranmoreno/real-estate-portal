-- CreateEnum
CREATE TYPE "ServiceRequestStatus" AS ENUM ('REQUESTED', 'IN_PROGRESS', 'CONFIRMED', 'COMPLETED', 'DECLINED', 'CANCELLED');

-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "serviceSanityId" TEXT,
    "serviceSlug" TEXT,
    "serviceName" TEXT NOT NULL,
    "serviceCategory" TEXT,
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "preferredDate" DATE,
    "preferredTime" TEXT,
    "partySize" INTEGER,
    "notes" TEXT,
    "internalNotes" TEXT,
    "quotedAmount" DECIMAL(10,2),
    "currency" TEXT DEFAULT 'USD',
    "addedManually" BOOLEAN NOT NULL DEFAULT false,
    "requestedByUserId" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceRequest_bookingId_idx" ON "ServiceRequest"("bookingId");

-- CreateIndex
CREATE INDEX "ServiceRequest_status_idx" ON "ServiceRequest"("status");

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
