/*
  Warnings:

  - Added the required column `text` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "text" VARCHAR(250) NOT NULL;
