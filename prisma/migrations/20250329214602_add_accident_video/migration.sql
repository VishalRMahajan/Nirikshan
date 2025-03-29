/*
  Warnings:

  - The primary key for the `CCTV` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `CCTV` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `CCTV` table. All the data in the column will be lost.
  - The `id` column on the `CCTV` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `hasAccidentVideo` to the `CCTV` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CCTV_ipAddress_key";

-- AlterTable
ALTER TABLE "CCTV" DROP CONSTRAINT "CCTV_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "ipAddress",
ADD COLUMN     "accidentVideoUrl" TEXT,
ADD COLUMN     "hasAccidentVideo" BOOLEAN NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "status" DROP DEFAULT,
ADD CONSTRAINT "CCTV_pkey" PRIMARY KEY ("id");
