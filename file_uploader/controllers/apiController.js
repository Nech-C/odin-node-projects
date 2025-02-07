const fs = require('fs').promises;
const path = require('path');

const asyncHandler = require('express-async-handler');
const { PrismaClient, Prisma } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

/**
 * Utility: Builds an array of folders (breadcrumb) from the bottom up.
 */
async function getBreadcrumbTrail(folderId) {
  const pathArr = [];
  let currentFolder = await prisma.folder.findUnique({
    where: { id: folderId },
  });

  while (currentFolder) {
    pathArr.unshift({
      id: currentFolder.id,
      name: currentFolder.name,
    });
    if (!currentFolder.parentId) break;

    currentFolder = await prisma.folder.findUnique({
      where: { id: currentFolder.parentId },
    });
  }

  return pathArr;
}

/**
 * Reads folder contents and returns JSON data for AJAX calls.
 */
module.exports.readFolderAjax = asyncHandler(async (req, res, next) => {
  console.log("[readFolderAjax] Called");

  // Determine which folder to read
  const folderId = req.query.folderId
    ? parseInt(req.query.folderId, 10)
    : req.user.rootFolderId;
  console.log(`[readFolderAjax] folderId resolved to: ${folderId}`);

  // Fetch the folder along with its children and files
  const currentFolder = await prisma.folder.findUnique({
    where: { id: folderId },
    include: {
      children: true,
      files: true,
    },
  });

  if (!currentFolder) {
    console.error(`[readFolderAjax] Folder not found with ID ${folderId}`);
    return res.status(404).json({ error: 'Folder not found' });
  }

  // Build the breadcrumb trail
  const breadcrumbPath = await getBreadcrumbTrail(folderId);
  console.log("[readFolderAjax] Successfully retrieved breadcrumb trail:", breadcrumbPath);

  // Return the folder data
  res.json({
    currentFolder: {
      id: currentFolder.id,
      name: currentFolder.name,
    },
    path: breadcrumbPath,
    folders: currentFolder.children.map((folder) => ({
      id: folder.id,
      name: folder.name,
    })),
    files: currentFolder.files.map((file) => ({
      id: file.id,
      name: file.name,
      size: file.size,
      createdAt: file.createdAt,
      url: file.url,
    })),
  });
});

/**
 * Allows the user to download a file if they're authenticated.
 */
module.exports.downloadFile = asyncHandler(async (req, res, next) => {
  console.log("[downloadFile] Called");

  // Check authentication
  if (!req.isAuthenticated()) {
    console.warn("[downloadFile] Unauthorized attempt - user not authenticated");
    return res.status(401).json({ message: 'not authenticated!' });
  }

  const fileId = req.query?.fileId;
  console.log(`[downloadFile] fileId from query: ${fileId}`);

  if (!fileId) {
    console.error("[downloadFile] No fileId specified in query");
    return res.status(400).json({ message: 'no resource specified' });
  }

  const file = await prisma.file.findFirst({
    where: { id: Number(fileId) },
  });

  if (!file) {
    console.warn(`[downloadFile] File not found in DB with ID ${fileId}`);
    return res.status(404).json({ message: "resource doesn't exist" });
  }

  // Construct full path to the file on disk
  const filePath = path.join(process.env.UPLOAD_PATH, file.url);
  console.log(`[downloadFile] Constructed filePath: ${filePath}`);

  // Check if the file actually exists on disk
  let fileExists = true;
  try {
    await fs.access(filePath);
  } catch (err) {
    fileExists = false;
  }

  if (fileExists) {
    console.log(`[downloadFile] Sending file: ${filePath}`);
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('[downloadFile] Error sending file:', err);
        return res.status(500).send('Error sending file. Please try again later');
      }
      console.log("[downloadFile] File sent successfully.");
    });
  } else {
    console.error(`[downloadFile] File does not exist on disk at ${filePath}`);
    return res.status(500).json({ message: "Internal server error! please contact site admin for help!" });
  }
});

/**
 * Deletes a file record and the actual file on disk.
 */
module.exports.deleteFile = asyncHandler(async (req, res, next) => {
  console.log("[deleteFile] Called");

  // Check authentication
  if (!req.isAuthenticated()) {
    console.warn("[deleteFile] Unauthorized attempt - user not authenticated");
    return res.status(401).json({ message: 'Not authenticated!' });
  }

  const fileId = Number(req.params.fileId);
  console.log(`[deleteFile] Attempting to delete file with ID ${fileId}`);

  // Fetch the file and its folder relation
  let targetFile;
  try {
    targetFile = await prisma.file.findUnique({
      where: { id: fileId },
      include: { folder: true },  // Include folder data to check ownership
    });
    console.log("[deleteFile] Found targetFile:", targetFile);
  } catch (err) {
    console.error("[deleteFile] Error finding file:", err);
    return res.status(404).json({ message: "File not found!" });
  }

  if (!targetFile) {
    console.warn(`[deleteFile] No file found with ID ${fileId}`);
    return res.status(404).json({ message: "File not found!" });
  }

  // Check ownership of the file
  const parentFolder = targetFile.folder;
  if (!parentFolder) {
    console.error("[deleteFile] No parent folder found in DB relation");
    return res.status(500).json({ message: "Internal server error" });
  }

  if (parentFolder.ownerId !== req.user.id) {
    console.error(`[deleteFile] Unauthorized deletion attempt by user ${req.user.id}. 
                   Actual owner is ${parentFolder.ownerId}`);
    return res.status(403).json({ message: "Unauthorized deletion" });
  }

  // Delete the file record from the database
  let deletedFile;
  try {
    deletedFile = await prisma.file.delete({
      where: { id: fileId },
    });
    console.log("[deleteFile] Deleted file record from DB:", deletedFile);
  } catch (err) {
    console.error("[deleteFile] Error deleting file record from DB:", err);
    return res.status(500).json({ message: "Internal server error" });
  }

  // Delete the file from the local filesystem
  const filePath = path.join(process.env.UPLOAD_PATH, deletedFile.url);
  console.log(`[deleteFile] Deleting file from disk at ${filePath}`);

  try {
    await fs.unlink(filePath);
    console.log("[deleteFile] Successfully deleted file from disk");
    res.status(204).json({ message: "File deleted" });
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn('[deleteFile] File not found on disk, but already deleted from DB:', err);
      res.status(204).json({ message: "File deleted (not found on disk)" });
    } else {
      console.error('[deleteFile] Error deleting file from disk:', err);
      res.status(500).json({ error: 'Internal Server Error.' });
    }
  }
});

/**
 * Deletes a folder (TODO: Not implemented).
 */
module.exports.deleteFolder = asyncHandler(async (req, res, next) => {
  console.log("[deleteFolder] Called");
  // Not yet implemented
  return res.status(501).json({ message: "not implemented!" });
});
