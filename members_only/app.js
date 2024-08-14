var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const compression = require('compression');
const helmet = require('helmet');


const apiRouter = require('./routes/api');

var app = express();


app.use(compression());

app.use(
    helmet.contentSecurityPolicy({
      directives: {
        "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
      },
    }),
);

const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20,
});

app.use(limiter);


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use('/api', apiRouter);

module.exports = app;
