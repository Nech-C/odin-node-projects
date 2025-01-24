-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_rootFolderId_fkey";

-- AlterTable
ALTER TABLE "folder" ADD COLUMN     "ownerId" INTEGER;

-- AddForeignKey
ALTER TABLE "folder" ADD CONSTRAINT "folder_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
