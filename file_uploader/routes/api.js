const express = require('express');

const router = express.Router();

const apiController = require('../controllers/apiController');

router.get('/folder', apiController.readFolderAjax);
router.get('/file', apiController.downloadFile);

module.exports = router;