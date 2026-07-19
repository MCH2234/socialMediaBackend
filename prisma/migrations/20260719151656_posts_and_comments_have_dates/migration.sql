/*
  Warnings:

  - Added the required column `date` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;
