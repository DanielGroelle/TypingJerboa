/*
  Warnings:

  - You are about to drop the `Race` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Race" DROP CONSTRAINT "Race_user_id_fkey";

-- DropTable
DROP TABLE "Race";

-- CreateTable
CREATE TABLE "races" (
    "id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "script" TEXT NOT NULL,
    "paragraph" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "races_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "races_user_id_key" ON "races"("user_id");

-- AddForeignKey
ALTER TABLE "races" ADD CONSTRAINT "races_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
