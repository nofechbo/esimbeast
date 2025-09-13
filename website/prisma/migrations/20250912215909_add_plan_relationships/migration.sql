/*
  Warnings:

  - You are about to drop the column `Price` on the `PlanOrder` table. All the data in the column will be lost.
  - You are about to drop the column `countryCodes` on the `PlanOrder` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `PlanOrder` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `PlanOrder` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `PlanOrder` table. All the data in the column will be lost.
  - You are about to drop the column `productName` on the `PlanOrder` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uniqueName]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uniqueName` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planId` to the `PlanOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `PlanOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Plan" ADD COLUMN     "uniqueName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."PlanOrder" DROP COLUMN "Price",
DROP COLUMN "countryCodes",
DROP COLUMN "data",
DROP COLUMN "duration",
DROP COLUMN "productId",
DROP COLUMN "productName",
ADD COLUMN     "planId" INTEGER NOT NULL,
ADD COLUMN     "price" DECIMAL(65,30) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Plan_uniqueName_key" ON "public"."Plan"("uniqueName");

-- CreateIndex
CREATE INDEX "Plan_uniqueName_idx" ON "public"."Plan"("uniqueName");

-- CreateIndex
CREATE INDEX "PlanOrder_planId_idx" ON "public"."PlanOrder"("planId");

-- AddForeignKey
ALTER TABLE "public"."PlanOrder" ADD CONSTRAINT "PlanOrder_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
