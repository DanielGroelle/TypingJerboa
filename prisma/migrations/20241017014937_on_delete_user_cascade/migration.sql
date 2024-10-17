-- DropForeignKey
ALTER TABLE "admins" DROP CONSTRAINT "admins_id_fkey";

-- DropForeignKey
ALTER TABLE "preferences" DROP CONSTRAINT "preferences_language_script_id_fkey";

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_language_script_id_fkey" FOREIGN KEY ("language_script_id") REFERENCES "language_scripts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
