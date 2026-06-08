/*
  Warnings:

  - Added the required column `orgId` to the `Assignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `Attempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `Certificate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "orgId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Assignment_orgId_idx" ON "Assignment"("orgId");

-- CreateIndex
CREATE INDEX "Attempt_orgId_idx" ON "Attempt"("orgId");

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
