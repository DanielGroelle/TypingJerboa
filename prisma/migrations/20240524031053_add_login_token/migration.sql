/*
  Warnings:

  - You are about to drop the column `session_token` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[login_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_session_token_fkey";

-- DropIndex
DROP INDEX "users_session_token_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "session_token",
ADD COLUMN     "login_token" TEXT;

-- CreateTable
CREATE TABLE "logins" (
    "token" TEXT NOT NULL,
    "expiry" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logins_pkey" PRIMARY KEY ("token")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_login_token_key" ON "users"("login_token");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_login_token_fkey" FOREIGN KEY ("login_token") REFERENCES "logins"("token") ON DELETE SET NULL ON UPDATE CASCADE;
