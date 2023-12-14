-- CreateTable
CREATE TABLE "newsposts" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT[],

    CONSTRAINT "newsposts_pkey" PRIMARY KEY ("id")
);
