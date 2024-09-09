/*
  Warnings:

  - A unique constraint covering the columns `[word,language_script_id]` on the table `words` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "words_word_language_script_id_key" ON "words"("word", "language_script_id");
