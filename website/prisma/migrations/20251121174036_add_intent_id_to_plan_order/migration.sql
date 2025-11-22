/*
  Warnings:

  - Added the required column `intentId` to the `PlanOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."PlanOrder" ADD COLUMN     "intentId" TEXT NOT NULL,
ALTER COLUMN "orderId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "PlanOrder_intentId_idx" ON "public"."PlanOrder"("intentId");
