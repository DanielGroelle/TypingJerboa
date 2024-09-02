/*
  Warnings:

  - Added the required column `lesson_characters` to the `lessons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "lesson_characters" TEXT NOT NULL;
