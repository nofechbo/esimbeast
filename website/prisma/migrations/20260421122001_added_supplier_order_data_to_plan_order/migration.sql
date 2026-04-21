/*
  Warnings:

  - You are about to drop the column `rcode` on the `PlanOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."PlanOrder" DROP COLUMN "rcode",
ADD COLUMN     "supplierOrderData" JSONB;
