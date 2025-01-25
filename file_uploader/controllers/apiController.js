const fs = require('fs');
const path = require('path');

const asyncHandler = require('express-async-handler');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function getBreadcrumbTrail(folderId) {
  const path = [];
  let currentFolder = await prisma.folder.findUnique({
    where: { id: folderId },
  });

  while (currentFolder) {
    path.unshift({
      id: currentFolder.id,
      name: currentFolder.name,
    });
    if (!currentFolder.parentId) break;
    currentFolder = await prisma.folder.findUnique({
      where: { id: currentFolder.parentId },
    });
  }

  return path;
}

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

  const path = await getBreadcrumbTrail(folderId);

  res.json({
    currentFolder: {
      id: currentFolder.id,
      name: currentFolder.name,
    },
    path, // The breadcrumb trail
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


module.exports.downloadFile = asyncHandler(async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({'message': 'not authenticated!'});
  }

  const fileId = req.query?.fileId;
  if (!fileId) {
    return res.status(400).json({ message: 'no resource specified' })
  }

  const file = await prisma.file.findFirst({
    where: {id: Number(fileId)}
  });

  if (!file) {
    return res.status(404).json({ message: 'resource doesn\'t exist' });
  }

  const filePath = path.join(process.env.UPLOAD_PATH, file.url);
  console.log(filePath);
  
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`)
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).send('Error sending file. Please try again later');
      }
    })
  } else {
    return res.status(500).json({ message: "Internal server error! please contact site admin for help!"});
  }
});
