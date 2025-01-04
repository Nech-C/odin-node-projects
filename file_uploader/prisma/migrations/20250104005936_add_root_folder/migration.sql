/*
  Warnings:

  - You are about to drop the column `userId` on the `file` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `folder` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rootFolderId]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rootFolderId` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "file" DROP CONSTRAINT "file_userId_fkey";

-- DropForeignKey
ALTER TABLE "folder" DROP CONSTRAINT "folder_userId_fkey";

-- AlterTable
ALTER TABLE "file" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "folder" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "rootFolderId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_rootFolderId_key" ON "user"("rootFolderId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_rootFolderId_fkey" FOREIGN KEY ("rootFolderId") REFERENCES "folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
