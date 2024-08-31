const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const messageController = require('../controllers/messageController');
const verifyToken = require('../middleware/verifyToken');

router.post('/register', userController.register);
router.post('/login', userController.login);

router.get('/messages', verifyToken, messageController.getAllMessages);
router.post('/messages', verifyToken, messageController.postMessage);

module.exports = router;