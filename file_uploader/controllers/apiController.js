const asyncHandler = require('express-async-handler');
const { PrismaClient } = require('@prisma/client');

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
