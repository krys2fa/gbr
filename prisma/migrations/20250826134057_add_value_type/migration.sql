-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'CUSTOMS_OFFICER';
ALTER TYPE "Role" ADD VALUE 'TECHNICAL_DIRECTOR';
ALTER TYPE "Role" ADD VALUE 'EXPORTER';

-- CreateTable
CREATE TABLE "value_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "value_type_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "value_type_name_key" ON "value_type"("name");
