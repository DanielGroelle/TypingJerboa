/*
  Warnings:

  - The primary key for the `races` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `language_script` on the `races` table. All the data in the column will be lost.
  - You are about to drop the column `paragraph` on the `races` table. All the data in the column will be lost.
  - The `id` column on the `races` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `user_id` column on the `races` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[session_token]` on the table `races` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[session_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `paragraph_id` to the `races` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "races" DROP CONSTRAINT "races_user_id_fkey";

-- DropIndex
DROP INDEX "races_user_id_key";

-- AlterTable
ALTER TABLE "races" DROP CONSTRAINT "races_pkey",
DROP COLUMN "language_script",
DROP COLUMN "paragraph",
ADD COLUMN     "end_time" TIMESTAMP(3),
ADD COLUMN     "paragraph_id" INTEGER NOT NULL,
ADD COLUMN     "session_token" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "start_time" DROP DEFAULT,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER,
ADD CONSTRAINT "races_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ADD COLUMN     "session_token" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "sessions" (
    "token" TEXT NOT NULL,
    "expiry" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "language_scripts" (
    "id" SERIAL NOT NULL,
    "language_script" TEXT NOT NULL,

    CONSTRAINT "language_scripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paragraphs" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "language_script_id" INTEGER NOT NULL,
    "language_script_index" INTEGER NOT NULL,

    CONSTRAINT "paragraphs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "paragraphs_language_script_id_language_script_index_key" ON "paragraphs"("language_script_id", "language_script_index");

-- CreateIndex
CREATE UNIQUE INDEX "races_session_token_key" ON "races"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_session_token_key" ON "users"("session_token");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_session_token_fkey" FOREIGN KEY ("session_token") REFERENCES "sessions"("token") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paragraphs" ADD CONSTRAINT "paragraphs_language_script_id_fkey" FOREIGN KEY ("language_script_id") REFERENCES "language_scripts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "races" ADD CONSTRAINT "races_paragraph_id_fkey" FOREIGN KEY ("paragraph_id") REFERENCES "paragraphs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "races" ADD CONSTRAINT "races_session_token_fkey" FOREIGN KEY ("session_token") REFERENCES "sessions"("token") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "races" ADD CONSTRAINT "races_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
