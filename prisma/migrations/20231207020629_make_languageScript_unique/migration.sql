/*
  Warnings:

  - A unique constraint covering the columns `[language_script]` on the table `language_scripts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "language_scripts_language_script_key" ON "language_scripts"("language_script");
