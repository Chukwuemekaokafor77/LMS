-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "externalOrgId" TEXT;

-- AlterTable
ALTER TABLE "Site" ADD COLUMN     "externalFacilityId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_externalOrgId_key" ON "Organization"("externalOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "Site_externalFacilityId_key" ON "Site"("externalFacilityId");

