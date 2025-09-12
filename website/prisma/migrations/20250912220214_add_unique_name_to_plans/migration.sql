/*
  Warnings:

  - You are about to drop the column `planId` on the `PlanOrder` table. All the data in the column will be lost.
  - Added the required column `data` to the `PlanOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `PlanOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `PlanOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `PlanOrder` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."PlanOrder" DROP CONSTRAINT "PlanOrder_planId_fkey";

-- DropIndex
DROP INDEX "public"."PlanOrder_planId_idx";

-- AlterTable
ALTER TABLE "public"."PlanOrder" DROP COLUMN "planId",
ADD COLUMN     "countryCodes" TEXT[],
ADD COLUMN     "data" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "productName" TEXT NOT NULL;
