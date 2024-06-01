/*
  Warnings:

  - A unique constraint covering the columns `[login_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users_login_token_key" ON "users"("login_token");
