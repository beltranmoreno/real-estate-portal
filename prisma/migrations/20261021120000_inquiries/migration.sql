-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'SELECTION_SENT', 'BOOKED', 'CLOSED');

-- CreateEnum
CREATE TYPE "InquirySource" AS ENUM ('PROPERTY', 'FAVORITES', 'MANUAL');

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "source" "InquirySource" NOT NULL,
    "channel" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "whatsapp" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "checkIn" DATE,
    "checkOut" DATE,
    "guests" INTEGER,
    "message" TEXT,
    "propertyIds" TEXT[],
    "propertyTitles" TEXT[],
    "estimateTotal" DECIMAL(10,2),
    "estimateCurrency" TEXT,
    "collectionId" TEXT,
    "collectionSlug" TEXT,
    "collectionAccessCode" TEXT,
    "collectionSentAt" TIMESTAMP(3),
    "collectionSentTo" TEXT,
    "notes" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Inquiry_reference_key" ON "Inquiry"("reference");

-- CreateIndex
CREATE INDEX "Inquiry_status_createdAt_idx" ON "Inquiry"("status", "createdAt");
