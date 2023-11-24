/*
  Warnings:

  - You are about to drop the column `shopifyId` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the column `shopLocalId` on the `VipProgram` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[storeId]` on the table `Shop` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `storeId` to the `Shop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `VipProgram` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "VipProgram" DROP CONSTRAINT "VipProgram_shopLocalId_fkey";

-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "shopifyId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "VipProgram" DROP COLUMN "shopLocalId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Shop_storeId_key" ON "Shop"("storeId");

-- AddForeignKey
ALTER TABLE "VipProgram" ADD CONSTRAINT "VipProgram_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Shop"("storeId") ON DELETE RESTRICT ON UPDATE CASCADE;
