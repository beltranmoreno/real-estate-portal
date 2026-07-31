-- Optional point-of-interest / attraction the admin attaches to a service
-- request. Links to a Sanity `attraction` doc; name is snapshotted.
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "attractionSanityId" TEXT;
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "attractionName" TEXT;
