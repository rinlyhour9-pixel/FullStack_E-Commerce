CREATE TYPE "PosPaymentMethod" AS ENUM ('cash', 'card', 'qr');

CREATE TABLE "PosSale" (
    "id" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "paymentMethod" "PosPaymentMethod" NOT NULL,
    "customerName" TEXT,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "staffId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PosSale_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PosSaleItem" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "variantLabel" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "lineTotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "PosSaleItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PosSale_receiptNumber_key" ON "PosSale"("receiptNumber");
CREATE INDEX "PosSale_createdAt_idx" ON "PosSale"("createdAt");
CREATE INDEX "PosSale_staffId_createdAt_idx" ON "PosSale"("staffId", "createdAt");
CREATE INDEX "PosSaleItem_saleId_idx" ON "PosSaleItem"("saleId");

ALTER TABLE "PosSale" ADD CONSTRAINT "PosSale_staffId_fkey"
    FOREIGN KEY ("staffId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PosSaleItem" ADD CONSTRAINT "PosSaleItem_saleId_fkey"
    FOREIGN KEY ("saleId") REFERENCES "PosSale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
