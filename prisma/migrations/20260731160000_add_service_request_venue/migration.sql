-- Optional named place for a service request (restaurant for a reservation,
-- event venue, etc.). Shown on the itinerary and request lists.
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "venueName" TEXT;
