-- CreateTable
CREATE TABLE "AssayCertificate" (
    "id" TEXT NOT NULL,
    "lots" INTEGER,
    "grossWeightGrams" DECIMAL(18,2) NOT NULL,
    "finenessPercent" DECIMAL(5,2) NOT NULL,
    "netWeightGrams" DECIMAL(18,2) NOT NULL,
    "netWeightOz" DECIMAL(12,3) NOT NULL,
    "customsSealNo" TEXT,
    "pmmcSealNo" TEXT,
    "otherSealNo" TEXT,
    "certificateNo" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "client" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "exporter" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "exportId" TEXT,

    CONSTRAINT "AssayCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssayCertificate_certificateNo_key" ON "AssayCertificate"("certificateNo");

-- AddForeignKey
ALTER TABLE "AssayCertificate" ADD CONSTRAINT "AssayCertificate_exportId_fkey" FOREIGN KEY ("exportId") REFERENCES "Export"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex for Payment.reference uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_reference_key" ON "Payment"("reference");
