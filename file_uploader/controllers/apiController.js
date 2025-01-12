const asyncHandler = require('express-async-handler');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports.readFolderAjax = asyncHandler(async (req, res, next) => {
  const folderId = req.query.folderId || req.user.rootFolderId;

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

  res.json({
    currentFolder: {
      id: currentFolder.id,
      name: currentFolder.name,
    },
    folders: currentFolder.children.map((folder) => ({
      id: folder.id,
      name: folder.name,
      })
    ),
    files: currentFolder.files.map((file)=>({
      id: files.id,
      name: file.name,
      size: file.size,
      createdAt: file.createdAt,
      url: file.url,
      })
    )
  })
});