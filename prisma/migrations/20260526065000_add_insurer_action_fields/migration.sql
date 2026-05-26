-- CreateEnum
CREATE TYPE "ClaimFaxHandlingType" AS ENUM ('fax', 'call_center_individual', 'unavailable', 'unknown');

-- CreateEnum
CREATE TYPE "CardPaymentStatus" AS ENUM ('available', 'unavailable', 'conditional', 'unknown');

-- AlterTable
ALTER TABLE "Insurer"
    ADD COLUMN "systemUrl" TEXT,
    ADD COLUMN "callMonitoringPhone" TEXT,
    ADD COLUMN "helpdeskPhone" TEXT,
    ADD COLUMN "cardPaymentInitialAvailable" BOOLEAN,
    ADD COLUMN "cardPaymentRecurringAvailable" BOOLEAN,
    ADD COLUMN "cardPaymentStatus" "CardPaymentStatus" NOT NULL DEFAULT 'unknown',
    ADD COLUMN "cardPaymentNote" TEXT,
    ADD COLUMN "claimFaxNumber" TEXT,
    ADD COLUMN "claimFaxHandlingType" "ClaimFaxHandlingType" NOT NULL DEFAULT 'unknown',
    ADD COLUMN "registeredMailAddress" TEXT,
    ADD COLUMN "claimFormUrl" TEXT,
    ADD COLUMN "termsUrl" TEXT,
    ADD COLUMN "sourceNote" TEXT,
    ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Insurer_sortOrder_idx" ON "Insurer"("sortOrder");

-- CreateIndex
CREATE INDEX "Insurer_isFeatured_idx" ON "Insurer"("isFeatured");

-- CreateIndex
CREATE INDEX "Insurer_cardPaymentStatus_idx" ON "Insurer"("cardPaymentStatus");

-- CreateIndex
CREATE INDEX "Insurer_claimFaxHandlingType_idx" ON "Insurer"("claimFaxHandlingType");
