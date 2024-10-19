/*
  Warnings:

  - You are about to drop the `preferences` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "preferences" DROP CONSTRAINT "preferences_id_fkey";

-- DropForeignKey
ALTER TABLE "preferences" DROP CONSTRAINT "preferences_language_script_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "language_script_preference_id" INTEGER;

-- DropTable
DROP TABLE "preferences";

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_language_script_preference_id_fkey" FOREIGN KEY ("language_script_preference_id") REFERENCES "language_scripts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
