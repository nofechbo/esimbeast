-- AlterTable: add as nullable first so existing rows are valid
ALTER TABLE "public"."PlanOrder" ADD COLUMN "supplier" TEXT;

-- Backfill from Plan via productId. DISTINCT ON picks one row per productId
-- (safe because any given productId should map to a single supplier).
UPDATE "public"."PlanOrder" po
SET "supplier" = p."supplier"
FROM (
    SELECT DISTINCT ON ("productId") "productId", "supplier"
    FROM "public"."Plan"
) p
WHERE po."productId" = p."productId";

-- Fallback for PlanOrder rows whose productId no longer exists in Plan.
UPDATE "public"."PlanOrder" SET "supplier" = 'unknown' WHERE "supplier" IS NULL;

-- Enforce NOT NULL now that every row has a value.
ALTER TABLE "public"."PlanOrder" ALTER COLUMN "supplier" SET NOT NULL;
