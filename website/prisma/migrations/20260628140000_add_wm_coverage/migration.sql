-- AlterTable
ALTER TABLE "public"."Plan" ADD COLUMN     "coverage" JSONB,
ADD COLUMN     "hasPhone" BOOLEAN NOT NULL DEFAULT false;
