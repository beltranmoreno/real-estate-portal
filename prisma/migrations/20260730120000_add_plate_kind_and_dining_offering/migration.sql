-- Add PLATE to the ServiceRequestKind enum (after MENU). IF NOT EXISTS keeps
-- this idempotent so a re-run against an already-migrated DB is a no-op.
ALTER TYPE "ServiceRequestKind" ADD VALUE IF NOT EXISTS 'PLATE' AFTER 'MENU';

-- Snapshotted à-la-carte plate selection for kind=PLATE.
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "plateItems" JSONB;

-- Per-booking dining curation (additive to the property's Sanity defaults).
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "offeredMenuSanityIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "offeredPlateSanityIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
