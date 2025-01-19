const express = require('express');

const router = express.Router();

const apiController = require('../controllers/apiController');

router.get('/folder', apiController.readFolderAjax);

module.exports = router;