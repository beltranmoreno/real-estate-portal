-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "feedbackEmailSentAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "BookingFeedback" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "reviewLeticia" TEXT,
    "reviewAgents" TEXT,
    "noteHouse" TEXT,
    "noteServices" TEXT,
    "general" TEXT,
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingFeedback_bookingId_key" ON "BookingFeedback"("bookingId");

-- CreateIndex
CREATE INDEX "BookingFeedback_bookingId_idx" ON "BookingFeedback"("bookingId");

-- AddForeignKey
ALTER TABLE "BookingFeedback" ADD CONSTRAINT "BookingFeedback_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
