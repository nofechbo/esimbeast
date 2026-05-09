-- AlterTable
ALTER TABLE "public"."PlanOrder" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "PlanOrder_status_idx" ON "public"."PlanOrder"("status");
