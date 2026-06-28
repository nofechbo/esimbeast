-- CreateTable
CREATE TABLE "public"."EsimLifecycle" (
    "id" SERIAL NOT NULL,
    "planOrderId" INTEGER NOT NULL,
    "intentId" TEXT NOT NULL,
    "supplier" TEXT NOT NULL DEFAULT 'EA',
    "entitlementType" TEXT NOT NULL,
    "promisedDataMb" INTEGER,
    "fairUseCapMb" INTEGER,
    "windowDays" INTEGER NOT NULL,
    "giftMb" INTEGER NOT NULL DEFAULT 0,
    "iccid" TEXT,
    "esimTranNo" TEXT,
    "baseSku" TEXT NOT NULL,
    "topUpSku" TEXT,
    "physicalCeilingMb" INTEGER NOT NULL,
    "giftDetectedMb" INTEGER NOT NULL DEFAULT 0,
    "managedCeilingMb" INTEGER NOT NULL,
    "refillThresholdPct" INTEGER NOT NULL DEFAULT 80,
    "refillIncrementMb" INTEGER NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'provisioned',
    "usedMb" INTEGER NOT NULL DEFAULT 0,
    "lastPolledAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "topUpCount" INTEGER NOT NULL DEFAULT 0,
    "paidTopUpMb" INTEGER NOT NULL DEFAULT 0,
    "safetyTopUpCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EsimLifecycle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EsimLifecycle_planOrderId_key" ON "public"."EsimLifecycle"("planOrderId");

-- CreateIndex
CREATE INDEX "EsimLifecycle_state_idx" ON "public"."EsimLifecycle"("state");

-- CreateIndex
CREATE INDEX "EsimLifecycle_esimTranNo_idx" ON "public"."EsimLifecycle"("esimTranNo");

-- CreateIndex
CREATE INDEX "EsimLifecycle_iccid_idx" ON "public"."EsimLifecycle"("iccid");

-- AddForeignKey
ALTER TABLE "public"."EsimLifecycle" ADD CONSTRAINT "EsimLifecycle_planOrderId_fkey" FOREIGN KEY ("planOrderId") REFERENCES "public"."PlanOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
