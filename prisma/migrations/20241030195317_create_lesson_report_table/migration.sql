-- CreateTable
CREATE TABLE "lesson_reports" (
    "id" SERIAL NOT NULL,
    "lesson_id" TEXT,
    "lesson_text" TEXT NOT NULL,
    "user_id" INTEGER,
    "session_token" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "lesson_reports" ADD CONSTRAINT "lesson_reports_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_reports" ADD CONSTRAINT "lesson_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_reports" ADD CONSTRAINT "lesson_reports_session_token_fkey" FOREIGN KEY ("session_token") REFERENCES "sessions"("token") ON DELETE SET NULL ON UPDATE CASCADE;
