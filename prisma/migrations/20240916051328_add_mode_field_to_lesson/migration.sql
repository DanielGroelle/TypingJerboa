/*
  Warnings:

  - Added the required column `mode` to the `lessons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "mode" TEXT NOT NULL;
