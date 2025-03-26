/*
  Warnings:

  - Added the required column `rtspUrl` to the `CCTV` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CCTV" ADD COLUMN     "rtspUrl" TEXT NOT NULL;
