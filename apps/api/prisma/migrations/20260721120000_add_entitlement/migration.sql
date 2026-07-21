-- CreateTable
CREATE TABLE "Entitlement" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "seats" INTEGER,
    "lastEventId" TEXT,
    "lastEventAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entitlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Entitlement_orgId_key" ON "Entitlement"("orgId");

-- AddForeignKey
ALTER TABLE "Entitlement" ADD CONSTRAINT "Entitlement_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
