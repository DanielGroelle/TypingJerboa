/*
  Warnings:

  - The primary key for the `lessons` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "user_word_encounters" DROP CONSTRAINT "user_word_encounters_lesson_id_fkey";

-- AlterTable
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "lessons_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "lessons_id_seq";

-- AlterTable
ALTER TABLE "user_word_encounters" ALTER COLUMN "lesson_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "user_word_encounters" ADD CONSTRAINT "user_word_encounters_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
