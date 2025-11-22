/*
  Warnings:

  - You are about to drop the column `Activation` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `Delivery` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `HotSpot` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `LocalNumber` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `NetworkSpeed` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `Networks` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `PlanType` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `SEOText` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `ipRoute` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `operators` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `salePrice` on the `Plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Plan" DROP COLUMN "Activation",
DROP COLUMN "Delivery",
DROP COLUMN "HotSpot",
DROP COLUMN "LocalNumber",
DROP COLUMN "NetworkSpeed",
DROP COLUMN "Networks",
DROP COLUMN "PlanType",
DROP COLUMN "SEOText",
DROP COLUMN "ipRoute",
DROP COLUMN "operators",
DROP COLUMN "salePrice",
ADD COLUMN     "activation" TEXT,
ADD COLUMN     "dailyDataCap" TEXT,
ADD COLUMN     "delivery" TEXT,
ADD COLUMN     "hotspot" TEXT,
ADD COLUMN     "localNumber" TEXT,
ADD COLUMN     "networkSpeed" TEXT,
ADD COLUMN     "networks" TEXT[],
ADD COLUMN     "planType" TEXT,
ADD COLUMN     "seoText" TEXT;
