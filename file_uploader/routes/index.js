var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).render('index');
});

router.get('/home', function(req, res, next) {
  const user = req.user;
  console.log(user);
  if (user) {
    return res.status(200).render('home', { user });
  } else {
    res.render('login', {files: []});
  }
});

module.exports = router;
