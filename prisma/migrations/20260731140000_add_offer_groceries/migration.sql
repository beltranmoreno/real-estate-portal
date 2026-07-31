-- Per-booking on/off toggle for grocery & drinks ordering. Off by default —
-- the admin turns it on (like the other concierge allow-lists).
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "offerGroceries" BOOLEAN NOT NULL DEFAULT false;
