const path = require('path');
const asyncHandler = require('express-async-handler');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const isAuthenticated = (req, res, next) => {
  console.log('Session User:', req.user); // Check if req.user is populated
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send('not authenticated!');
};


const uploadMiddleware = [
  isAuthenticated,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication failed!' });
    }

    try {
      if (!req.files || !req.files.file) {
        return res.status(400).json({ error: 'No files uploaded!' });
      }

      const uploadedFiles = [];
      let parentId = req.body.parentId;

      if (!parentId) {
        const user = await prisma.user.findFirst({ where: { id: req.user.id } });
        parentId = user.rootFolderId;
      }

      for (const file of req.files.file) {
        const savedFile = await prisma.file.create({
          data: {
            name: file.originalname,
            size: file.size,
            url: `/uploads/${file.filename}`,
            folderId: parentId,
          },
        });
        uploadedFiles.push(savedFile);
      }

      res.status(201).json({
        message: 'Files uploaded successfully',
        files: uploadedFiles,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'File upload failed' });
    }
  }),
];

module.exports.upload = uploadMiddleware;
