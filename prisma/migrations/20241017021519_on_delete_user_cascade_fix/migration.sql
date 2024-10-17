-- DropForeignKey
ALTER TABLE "preferences" DROP CONSTRAINT "preferences_id_fkey";

-- AddForeignKey
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
