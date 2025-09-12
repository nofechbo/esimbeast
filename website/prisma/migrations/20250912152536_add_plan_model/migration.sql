-- CreateTable
CREATE TABLE "public"."Plan" (
    "id" SERIAL NOT NULL,
    "productId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "limited" BOOLEAN NOT NULL,
    "fup" TEXT NOT NULL,
    "data" DECIMAL(65,30) NOT NULL,
    "reducedSpeed" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "reloadable" BOOLEAN NOT NULL,
    "countryCodes" TEXT[],
    "ipRoute" TEXT,
    "operators" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "apn" TEXT,
    "salePrice" DECIMAL(65,30),

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Plan_productId_idx" ON "public"."Plan"("productId");

-- CreateIndex
CREATE INDEX "Plan_countryCodes_idx" ON "public"."Plan" USING GIN ("countryCodes");
