-- Optional end date for multi-day service requests (car hire, boat charter,
-- staff over several days). preferredDate is the start; endDate the inclusive
-- end. Both optional.
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "endDate" DATE;
