-- CreateEnum
CREATE TYPE "RejectionType" AS ENUM ('WRONG_LOCATION', 'BAD_QUALITY', 'WRONG_CREATIVE', 'CUSTOM');

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "rejectionType" "RejectionType";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "brandId" TEXT,
ADD COLUMN     "vendorId" TEXT;

-- CreateTable
CREATE TABLE "_AgentSites" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AgentSites_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AgentSites_B_index" ON "_AgentSites"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentSites" ADD CONSTRAINT "_AgentSites_A_fkey" FOREIGN KEY ("A") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentSites" ADD CONSTRAINT "_AgentSites_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
