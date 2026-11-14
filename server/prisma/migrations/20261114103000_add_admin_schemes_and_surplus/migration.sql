-- CreateEnum
CREATE TYPE "SchemeStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "SurplusStatus" AS ENUM ('OPEN', 'RESOLVED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Scheme" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "department" TEXT NOT NULL DEFAULT 'Department of Agriculture',
    "benefits" TEXT NOT NULL,
    "eligibilityCriteria" TEXT,
    "requiredDocuments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "applicationProcess" TEXT,
    "officialUrl" TEXT,
    "state" TEXT,
    "deadline" TIMESTAMP(3),
    "status" "SchemeStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurplusAlert" (
    "id" UUID NOT NULL,
    "farmerId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "surplusQuantity" DECIMAL(14,3) NOT NULL,
    "reason" TEXT,
    "status" "SurplusStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurplusAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Scheme_status_createdAt_idx" ON "Scheme"("status", "createdAt");

-- CreateIndex
CREATE INDEX "SurplusAlert_status_createdAt_idx" ON "SurplusAlert"("status", "createdAt");

-- CreateIndex
CREATE INDEX "SurplusAlert_farmerId_idx" ON "SurplusAlert"("farmerId");

-- CreateIndex
CREATE INDEX "SurplusAlert_productId_idx" ON "SurplusAlert"("productId");

-- AddForeignKey
ALTER TABLE "SurplusAlert" ADD CONSTRAINT "SurplusAlert_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "FarmerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurplusAlert" ADD CONSTRAINT "SurplusAlert_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
