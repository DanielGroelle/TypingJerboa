/*
  Warnings:

  - Added the required column `language_script_id` to the `lessons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "language_script_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_language_script_id_fkey" FOREIGN KEY ("language_script_id") REFERENCES "language_scripts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
