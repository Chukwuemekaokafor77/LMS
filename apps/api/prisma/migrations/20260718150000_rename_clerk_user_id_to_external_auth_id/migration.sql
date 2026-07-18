-- Rename User.clerkUserId -> User.externalAuthId (LMS-M6 step 2 prep).
-- Hand-written as a true rename: `prisma migrate dev` would generate a
-- destructive DROP COLUMN + ADD COLUMN, losing every existing auth link.
ALTER TABLE "User" RENAME COLUMN "clerkUserId" TO "externalAuthId";
ALTER INDEX "User_clerkUserId_key" RENAME TO "User_externalAuthId_key";
