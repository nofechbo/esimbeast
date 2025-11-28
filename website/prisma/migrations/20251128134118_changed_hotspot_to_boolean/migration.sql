/*
  Warnings:

  - The `hotspot` column on the `Plan` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Plan" DROP COLUMN "hotspot",
ADD COLUMN     "hotspot" BOOLEAN;
