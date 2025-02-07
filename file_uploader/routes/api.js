const express = require('express');

const router = express.Router();

const apiController = require('../controllers/apiController');

router.get('/folder', apiController.readFolderAjax);
router.get('/file', apiController.downloadFile);
router.get('/delete/file/:fileId', apiController.deleteFile);
router.get('/delete/folder/:folderId', apiController.deleteFolder)
module.exports = router;
