const fs = require('fs').promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Removes a file's record in the DB and the actual file from the filesystem.
 * No permission checks — caller must handle that.
 */
async function removeFileFromSystem(fileId) {
  // 1. Find the file record in DB
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    throw new Error(`File with ID ${fileId} not found`);
  }

  // 2. Delete the file record from DB
  await prisma.file.delete({
    where: { id: fileId },
  });

  // 3. Delete file from the local filesystem
  const filePath = path.join(process.env.UPLOAD_PATH, file.url);

  try {
    await fs.unlink(filePath);
    console.log(`[removeFileFromSystem] Successfully removed file from disk: ${filePath}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn(`[removeFileFromSystem] File not found on disk: ${filePath}`);
    } else {
      console.error('[removeFileFromSystem] Error removing file from disk:', err);
      throw err;
    }
  }
}

/**
 * Recursively removes a folder, including its files and any nested folders.
 * No permission checks — caller must handle that.
 */
async function removeFolderRecursive(folderId) {
  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
    include: {
      files: true,
      children: true,
    },
  });

  if (!folder) {
    throw new Error(`Folder with ID ${folderId} not found`);
  }

  // Delete all files in this folder
  for (const file of folder.files) {
    await removeFileFromSystem(file.id);
  }

  // Recursively delete subfolders
  for (const childFolder of folder.children) {
    await removeFolderRecursive(childFolder.id);
  }

  // Delete this folder from the DB
  await prisma.folder.delete({
    where: { id: folderId },
  });
}

module.exports = {
  removeFileFromSystem,
  removeFolderRecursive,
};
