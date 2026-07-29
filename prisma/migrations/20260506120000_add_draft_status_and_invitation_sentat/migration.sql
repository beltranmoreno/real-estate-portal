-- Add DRAFT to the BookingStatus enum (ordered before PENDING)
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'DRAFT' BEFORE 'PENDING';

-- Track when the invitation email was actually sent (null = prepared, not sent)
ALTER TABLE "Invitation" ADD COLUMN IF NOT EXISTS "sentAt" TIMESTAMP(3);
