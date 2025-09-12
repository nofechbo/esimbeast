/*
  Warnings:

  - You are about to drop the column `wmProductId` on the `PlanOrder` table. All the data in the column will be lost.
  - Added the required column `productId` to the `PlanOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."PlanOrder" DROP COLUMN "wmProductId",
ADD COLUMN     "productId" TEXT NOT NULL;
