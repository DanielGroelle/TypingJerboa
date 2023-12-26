/*
  Warnings:

  - Added the required column `post_date` to the `newsposts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "newsposts" ADD COLUMN     "post_date" TIMESTAMP(3) NOT NULL;
