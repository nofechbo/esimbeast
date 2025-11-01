-- AlterTable
ALTER TABLE "public"."Plan" ADD COLUMN     "Activation" TEXT,
ADD COLUMN     "Delivery" TEXT,
ADD COLUMN     "HotSpot" BOOLEAN,
ADD COLUMN     "LocalNumber" BOOLEAN,
ADD COLUMN     "Networks" TEXT,
ADD COLUMN     "PlanType" TEXT,
ADD COLUMN     "SEOText" TEXT,
ADD COLUMN     "eKYC" BOOLEAN;
