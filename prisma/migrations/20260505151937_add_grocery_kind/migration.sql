-- CreateEnum
CREATE TYPE "ServiceRequestKind" AS ENUM ('SERVICE', 'MENU', 'GROCERY', 'CUSTOM');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "serviceRequestId" TEXT;

-- AlterTable
ALTER TABLE "ServiceRequest" ADD COLUMN     "groceryItems" JSONB,
ADD COLUMN     "kind" "ServiceRequestKind" NOT NULL DEFAULT 'SERVICE',
ADD COLUMN     "menuName" TEXT,
ADD COLUMN     "menuSanityId" TEXT;

-- CreateIndex
CREATE INDEX "Document_serviceRequestId_idx" ON "Document"("serviceRequestId");

-- CreateIndex
CREATE INDEX "ServiceRequest_kind_idx" ON "ServiceRequest"("kind");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
