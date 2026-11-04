-- Inquiry: nationality, bedrooms, per-house admin comments
ALTER TABLE "Inquiry" ADD COLUMN "nationality" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN "bedrooms" INTEGER;
ALTER TABLE "Inquiry" ADD COLUMN "propertyNotes" JSONB;

-- User: email optional (phone-only guests), nationality, address
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "User" ADD COLUMN "nationality" TEXT;
ALTER TABLE "User" ADD COLUMN "addressLine1" TEXT;
ALTER TABLE "User" ADD COLUMN "addressLine2" TEXT;
ALTER TABLE "User" ADD COLUMN "city" TEXT;
ALTER TABLE "User" ADD COLUMN "region" TEXT;
ALTER TABLE "User" ADD COLUMN "postalCode" TEXT;
ALTER TABLE "User" ADD COLUMN "country" TEXT;

-- Booking: nightly rate, commission as an amount
ALTER TABLE "Booking" ADD COLUMN "commissionAmount" DECIMAL(10,2);
ALTER TABLE "Booking" ADD COLUMN "nightlyRate" DECIMAL(10,2);

-- Payments: received or still expected (existing rows were all received)
ALTER TABLE "BookingPayment" ADD COLUMN "received" BOOLEAN NOT NULL DEFAULT true;
