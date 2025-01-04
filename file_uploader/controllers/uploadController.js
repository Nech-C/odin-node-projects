const path = require('path');
const asyncHandler = require('express-async-handler');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();



module.exports.upload = [
  asyncHandler(async (req, res) => {
    try {
      // Access the uploaded files from req.files
      if (!req.files || !req.files.file) {
        return res.status(400).json({ error: 'No files uploaded!' });
      }

      const uploadedFiles = req.files.file;
      const savedFiles = [];
      
      // root will be used if the parent folder is not specified
      let parentId = req.body.parentId
      if (!req.body.parentId) {
        const user = await prisma.user.findFirst({
          where: { id: req.user.id }
        });
        parentId = user.rootFolderId;
      }

      // Iterate over all uploaded files and save them
      for (const file of uploadedFiles) {
        console.debug(file);

        const savedFile = await prisma.file.create({
          data: {
            name: file.originalname,
            size: file.size,
            url: `/uploads/${file.filename}`,
            folderId: parentId,
          },
        });

        savedFiles.push(savedFile);
      }

      res.status(201).json({
        message: 'Files uploaded successfully',
        files: savedFiles,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'File upload failed' });
    }
  }),
];
