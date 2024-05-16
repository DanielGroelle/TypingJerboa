/*
  Warnings:

  - You are about to drop the column `language_script_index` on the `paragraphs` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "paragraphs_language_script_id_language_script_index_key";

-- AlterTable
ALTER TABLE "paragraphs" DROP COLUMN "language_script_index";
