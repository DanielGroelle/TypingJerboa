/*
  Warnings:

  - You are about to drop the `logins` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "races" DROP CONSTRAINT "races_user_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_login_token_fkey";

-- DropIndex
DROP INDEX "users_login_token_key";

-- AlterTable
ALTER TABLE "sessions" ALTER COLUMN "expiry" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "login_expiry" TIMESTAMP(3);

-- DropTable
DROP TABLE "logins";

-- AddForeignKey
ALTER TABLE "races" ADD CONSTRAINT "races_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
