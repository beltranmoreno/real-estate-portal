-- Waiting-for-payment status on document requests
ALTER TYPE "RequestStatus" ADD VALUE 'AWAITING_PAYMENT';

-- Service-specific answers on concierge requests
ALTER TABLE "ServiceRequest" ADD COLUMN "details" JSONB;
