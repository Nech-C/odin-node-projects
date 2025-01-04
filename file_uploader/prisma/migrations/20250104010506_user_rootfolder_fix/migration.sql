-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_rootFolderId_fkey";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "rootFolderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_rootFolderId_fkey" FOREIGN KEY ("rootFolderId") REFERENCES "folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
