-- AlterEnum
ALTER TYPE "RequestStatus" ADD VALUE 'PENDING_REVIEW';

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "reviewNote" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedByUserId" TEXT;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
