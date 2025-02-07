const path = require('path');
const fs = require('fs');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require("express-validator");
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const isAuthenticated = (req, res, next) => {
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
      let parentId = Number(req.body.parentId);

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

const uploadFolder = [
  // isAuthenticated,
  // body("newFolderName")
  //   .trim()
  //   .escape()
  //   .isAlphanumeric()
  //   .withMessage("The username cannot have non-alphanumeric characters!")
  //   .isLength({ min:1 })
  //   .withMessage("The folder name must contain at least one alphanumeric character!"),

  asyncHandler(async (req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     console.log(errors.array());
    //     return res.status(400).json({ message: "incorrect folder name format" });
    // }


    const parentFolderId = req.body.targetParentFolderId;
    const newFolderName = req.body.newFolderName;
    console.log(parentFolderId)
    console.log(newFolderName)
    if (parentFolderId) {
      const parentFolder = await prisma.folder.findFirst({
        where: {
          id: Number(parentFolderId),
        },
      });
    
      if (!parentFolder) {
        return res.status(400).json({ message: "Invalid parent folder ID" });
      }
    }

    console.log(parentFolderId)
    console.log(newFolderName)

    let newFolder = null;
    try {
      newFolder = await prisma.folder.create({
        data: {
          name: newFolderName,
          // Use connect only if parentFolderId is not null
          parent: parentFolderId ? { connect: { id: Number(parentFolderId) } } : undefined,
          owner: {
            connect: { id: req.user.id },
          },
        },
      });

      console.log(newFolder)
    } catch (error) {
      console.error(error);
      return res.status(500).json({"message": "Intenal server error"})
    }
    if (newFolder){
      return res.status(201).json({"message": "Folder created successfully"})
    }

    console.error(newFolder)
    return res.status(500).json({"message": "Intenal server error"})

  }),

];

module.exports = {
  upload: uploadMiddleware,
  uploadFolder: uploadFolder,
};
