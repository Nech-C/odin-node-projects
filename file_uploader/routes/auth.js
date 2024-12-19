let express = require('express');
let router = express.Router();
let passport = require('passport');
let localStrategy = require('passport-local');
let crypto = require('crypto')


router.get('/login', function(req, res, next) {
    if (req.user) {
        return res.redirect('/home')
    }
    res.render('login');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login'
}));

module.exports = router;