-- Per-booking concierge-service allow-list. Nothing is offered to the guest
-- unless the admin turns it on. Alongside offeredMenuSanityIds / offeredPlateSanityIds.
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "offeredServiceSanityIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
