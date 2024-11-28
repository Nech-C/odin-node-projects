let express = require('express');
let router = express.Router();
let passport = require('passport');
let localStrategy = require('passport-local');
let crypto = require('crypto')
let db = require('../db')


router.get('/login', function(req, res, next) {
    res.render('login');
});

module.exports = router;