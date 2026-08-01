-- AlterTable: readable bilingual lesson body (text lessons before BYO video)
ALTER TABLE "Lesson" ADD COLUMN "bodyEn" TEXT,
ADD COLUMN "bodyFr" TEXT;
