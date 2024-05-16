-- DropForeignKey
ALTER TABLE "races" DROP CONSTRAINT "races_paragraph_id_fkey";

-- AddForeignKey
ALTER TABLE "races" ADD CONSTRAINT "races_paragraph_id_fkey" FOREIGN KEY ("paragraph_id") REFERENCES "paragraphs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
