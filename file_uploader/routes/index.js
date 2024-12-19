var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).render('index');
});

router.get('/home', function(req, res, next) {
  res.status(200).render('home');
});

module.exports = router;
