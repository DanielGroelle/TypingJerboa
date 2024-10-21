-- CreateTable
CREATE TABLE "paragraph_reports" (
    "id" SERIAL NOT NULL,
    "paragraph_id" INTEGER,
    "paragraph_text" TEXT NOT NULL,
    "user_id" INTEGER,
    "session_token" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paragraph_reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "paragraph_reports" ADD CONSTRAINT "paragraph_reports_paragraph_id_fkey" FOREIGN KEY ("paragraph_id") REFERENCES "paragraphs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paragraph_reports" ADD CONSTRAINT "paragraph_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paragraph_reports" ADD CONSTRAINT "paragraph_reports_session_token_fkey" FOREIGN KEY ("session_token") REFERENCES "sessions"("token") ON DELETE SET NULL ON UPDATE CASCADE;
