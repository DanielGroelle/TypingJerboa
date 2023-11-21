/*
  Warnings:

  - You are about to drop the column `script` on the `races` table. All the data in the column will be lost.
  - Added the required column `language_script` to the `races` table without a default value. This is not possible if the table is not empty.
  - Made the column `paragraph` on table `races` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "races" DROP COLUMN "script",
ADD COLUMN     "language_script" TEXT NOT NULL,
ALTER COLUMN "paragraph" SET NOT NULL;
