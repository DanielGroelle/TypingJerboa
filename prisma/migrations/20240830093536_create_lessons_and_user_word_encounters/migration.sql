-- CreateTable
CREATE TABLE "lessons" (
    "id" SERIAL NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "lesson_text" TEXT NOT NULL,
    "mistakes" INTEGER,
    "session_token" TEXT,
    "user_id" INTEGER,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "words" (
    "id" SERIAL NOT NULL,
    "language_script_id" INTEGER NOT NULL,
    "word" TEXT NOT NULL,

    CONSTRAINT "words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_word_encounters" (
    "id" SERIAL NOT NULL,
    "word_id" INTEGER NOT NULL,
    "mistakes" INTEGER NOT NULL,
    "time_encountered" TIMESTAMP(3) NOT NULL,
    "lesson_id" INTEGER,
    "race_id" TEXT,
    "session_token" TEXT,
    "user_id" INTEGER,

    CONSTRAINT "user_word_encounters_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_session_token_fkey" FOREIGN KEY ("session_token") REFERENCES "sessions"("token") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "words" ADD CONSTRAINT "words_language_script_id_fkey" FOREIGN KEY ("language_script_id") REFERENCES "language_scripts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_word_encounters" ADD CONSTRAINT "user_word_encounters_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "words"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_word_encounters" ADD CONSTRAINT "user_word_encounters_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_word_encounters" ADD CONSTRAINT "user_word_encounters_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "races"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_word_encounters" ADD CONSTRAINT "user_word_encounters_session_token_fkey" FOREIGN KEY ("session_token") REFERENCES "sessions"("token") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_word_encounters" ADD CONSTRAINT "user_word_encounters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
