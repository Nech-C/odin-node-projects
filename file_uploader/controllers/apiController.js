const fs = require('fs').promises;
const path = require('path');

const asyncHandler = require('express-async-handler');
const { PrismaClient } = require('@prisma/client');
const { removeFileFromSystem, removeFolderRecursive } = require('./utils');
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
  const folderId = req.query.folderId
    ? parseInt(req.query.folderId, 10)
    : req.user.rootFolderId;

  const currentFolder = await prisma.folder.findUnique({
    where: { id: folderId },
    include: {
      children: true,
      files: true,
    },
  });

  if (!currentFolder) {
    return res.status(404).json({ error: 'Folder not found' });
  }

  const breadcrumbPath = await getBreadcrumbTrail(folderId);

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
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'not authenticated!' });
  }

  const fileId = req.params?.fileId;
  if (!fileId) {
    return res.status(400).json({ message: 'no resource specified' });
  }

  const file = await prisma.file.findFirst({
    where: { id: Number(fileId) },
  });

  if (!file) {
    return res.status(404).json({ message: "resource doesn't exist" });
  }

  const filePath = path.join(process.env.UPLOAD_PATH, file.url);

  try {
    await fs.access(filePath);
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    res.sendFile(filePath, (err) => {
      if (err) {
        return res.status(500).send('Error sending file. Please try again later');
      }
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error! please contact site admin for help!" });
  }
});

/**
 * Deletes a file record and the actual file on disk.
 */
module.exports.deleteFile = asyncHandler(async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated!' });
  }

  const fileId = Number(req.params.fileId);

  const targetFile = await prisma.file.findUnique({
    where: { id: fileId },
    include: { folder: true },
  });

  if (!targetFile) {
    return res.status(404).json({ message: "File not found!" });
  }

  const parentFolder = targetFile.folder;
  if (parentFolder.ownerId !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized deletion" });
  }

  try {
    await removeFileFromSystem(fileId);
    res.status(204).json({ message: "File deleted" });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});

/**
 * Deletes a folder and all its contents recursively.
 */
module.exports.deleteFolder = asyncHandler(async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated!' });
  }

  const folderId = Number(req.params.folderId);

  const targetFolder = await prisma.folder.findUnique({
    where: { id: folderId },
  });

  if (!targetFolder) {
    return res.status(404).json({ error: 'Folder not found' });
  }

  if (targetFolder.ownerId !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized deletion" });
  }

  try {
    await removeFolderRecursive(folderId);
    res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete folder' });
  }
});
