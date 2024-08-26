const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const messageController = require('../controllers/messageController');

router.post('/register', userController.register);

router.get('/messages', messageController.getAllMessages);

router.post('/messages', messageController.postMessage);

module.exports = router;