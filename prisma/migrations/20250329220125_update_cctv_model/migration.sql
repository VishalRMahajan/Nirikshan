/*
  Warnings:

  - You are about to drop the `CCTV` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "CCTV";

-- CreateTable
CREATE TABLE "cCTV" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "rtspUrl" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "accidentVideoUrl" TEXT,
    "hasAccidentVideo" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cCTV_pkey" PRIMARY KEY ("id")
);
