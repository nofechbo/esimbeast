-- CreateTable
CREATE TABLE "public"."PlanOrder" (
    "id" SERIAL NOT NULL,
    "orderId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "wmProductId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "countryCodes" TEXT[],
    "data" DECIMAL(65,30) NOT NULL,
    "duration" INTEGER NOT NULL,
    "Price" DECIMAL(65,30) NOT NULL,
    "orderTime" TIMESTAMP(3) NOT NULL,
    "qrLink" TEXT,
    "lpa" TEXT,

    CONSTRAINT "PlanOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlanOrder_orderId_idx" ON "public"."PlanOrder"("orderId");
