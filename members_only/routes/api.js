const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const messageController = require('../controllers/messageController');
const inviteCodeController = require('../controllers/inviteCodeController');
const verifyToken = require('../middleware/verifyToken');


router.post('/register', userController.register);
router.post('/login', userController.login);
router.get("/check-auth", verifyToken, (req, res) => {
  res.status(200).json({ user: req.user });
});
router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
});
router.get('/user', verifyToken, userController.user);


router.get('/messages', verifyToken, messageController.getAllMessages);
router.post('/messages', verifyToken, messageController.postMessage);

router.get('/question', verifyToken, inviteCodeController.getQuestion);
router.post('/check-answer', verifyToken, inviteCodeController.checkAnswer);
router.post('/validate-invite-code', verifyToken, inviteCodeController.validateInviteCode);

module.exports = router;