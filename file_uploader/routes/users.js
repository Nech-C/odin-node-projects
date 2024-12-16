const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.status(200).render('login')
});

router.post('/', userController.login);

router.get('/signup', function(req, res, next) {
  res.status(200).render('sign_up');
})

router.post('/signup', userController.createUser);


module.exports = router;
