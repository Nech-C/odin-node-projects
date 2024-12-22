const express = require('express');
const passport = require('passport')
const userController = require('../controllers/userController')

const router = express.Router();

/* GET users listing. */
router.get('/signup', function(req, res, next) {
  res.status(200).render('sign_up', {username: '', password: ''});
});

router.post('/signup', userController.createUser);


module.exports = router;
