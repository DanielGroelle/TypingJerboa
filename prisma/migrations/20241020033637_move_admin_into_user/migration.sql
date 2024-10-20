/*
  Warnings:

  - You are about to drop the `admins` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "admins" DROP CONSTRAINT "admins_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "admin" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "admins";
