const express = require('express');
const passport = require('passport')
const userController = require('../controllers/userController')

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.status(200).render('login')
});

router.post('/', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/user'
}));

router.get('/signup', function(req, res, next) {
  res.status(200).render('sign_up');
})

router.post('/signup', userController.createUser);


module.exports = router;
