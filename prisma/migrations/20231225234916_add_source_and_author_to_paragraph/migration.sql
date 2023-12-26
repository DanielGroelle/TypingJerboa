/*
  Warnings:

  - Added the required column `author` to the `paragraphs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `paragraphs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "paragraphs" ADD COLUMN     "author" TEXT NOT NULL,
ADD COLUMN     "source" TEXT NOT NULL;
