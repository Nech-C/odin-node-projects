const express = require('express');
const router = express.Router();
const usernameController = require('../controllers/username');


router.get('/', (req, res) => {
    console.log("usernames will be logged here - wip")
    usernameController.getUsernames(req, res);
});


router.get("/new", (req, res) => {
    usernameController.createUsernameGet(req, res);
});

router.post("/new", (req, res) => {
    usernameController.createUsernamePost(req, res);
});

module.exports = router;