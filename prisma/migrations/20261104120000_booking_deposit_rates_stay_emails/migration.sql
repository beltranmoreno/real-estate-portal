-- Rate changes during a stay, commission paid, security deposit, day-of emails
ALTER TABLE "Booking" ADD COLUMN "nightlyRates" JSONB;
ALTER TABLE "Booking" ADD COLUMN "commissionPaid" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN "commissionPaidOn" DATE;
ALTER TABLE "Booking" ADD COLUMN "securityDeposit" DECIMAL(10,2);
ALTER TABLE "Booking" ADD COLUMN "depositReturned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN "depositReturnedOn" DATE;
ALTER TABLE "Booking" ADD COLUMN "checkInEmailSentAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "checkOutEmailSentAt" TIMESTAMP(3);
