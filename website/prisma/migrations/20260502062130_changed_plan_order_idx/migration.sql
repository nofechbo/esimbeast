-- DropIndex
DROP INDEX "public"."PlanOrder_status_idx";

-- DropIndex
DROP INDEX "public"."PlanOrder_supplier_idx";

-- CreateIndex
CREATE INDEX "PlanOrder_supplier_status_idx" ON "public"."PlanOrder"("supplier", "status");
