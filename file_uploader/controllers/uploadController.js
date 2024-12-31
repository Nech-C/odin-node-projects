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

      // Iterate over all uploaded files and save them
      for (const file of uploadedFiles) {
        console.debug(file);

        const savedFile = await prisma.file.create({
          data: {
            name: file.originalname,
            size: file.size,
            url: `/uploads/${file.filename}`,
            userId: req.user.id, // Ensure req.user.id exists
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
