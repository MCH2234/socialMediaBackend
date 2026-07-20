/*
  Warnings:

  - A unique constraint covering the columns `[fromId,toId]` on the table `FollowRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FollowRequest_fromId_toId_key" ON "FollowRequest"("fromId", "toId");
