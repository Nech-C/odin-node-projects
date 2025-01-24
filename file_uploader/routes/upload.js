const express = require('express');
const uploadController = require('../controllers/uploadController');


const router = express.Router();

// Configure Multer for file uploads
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const cpUpload = upload.fields([{ name: 'file', maxCount: 20 }]);

router.post('/upload', (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.send('not authenticated!');
  }
  next();
}, cpUpload, uploadController.upload);

router.post('/createFolder', uploadController.uploadFolder);

module.exports = router;