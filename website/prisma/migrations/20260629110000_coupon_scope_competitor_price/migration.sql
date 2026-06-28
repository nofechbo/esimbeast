-- AlterTable
ALTER TABLE "public"."Coupon" ADD COLUMN     "supplierScope" TEXT;

-- CreateTable
CREATE TABLE "public"."CompetitorPrice" (
    "id" SERIAL NOT NULL,
    "planId" INTEGER NOT NULL,
    "competitorCents" INTEGER NOT NULL,
    "competitor" TEXT,
    "source" TEXT NOT NULL DEFAULT 'esimdb',
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitorPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompetitorPrice_planId_key" ON "public"."CompetitorPrice"("planId");
