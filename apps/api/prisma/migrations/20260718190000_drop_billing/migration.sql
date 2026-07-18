-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_orgId_fkey";

-- DropIndex
DROP INDEX "Organization_stripeCustomerId_key";

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "stripeCustomerId";

-- DropTable
DROP TABLE "Subscription";

-- DropEnum
DROP TYPE "SubscriptionStatus";

