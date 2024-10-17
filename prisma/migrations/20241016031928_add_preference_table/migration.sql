-- CreateTable
CREATE TABLE "preferences" (
    "id" INTEGER NOT NULL,
    "language_script_id" INTEGER NOT NULL,

    CONSTRAINT "preferences_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_language_script_id_fkey" FOREIGN KEY ("language_script_id") REFERENCES "language_scripts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
