/*
  Warnings:

  - Added the required column `reply_count` to the `comments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "reply_count" INTEGER NOT NULL;
