var path = require('path');
var createError = require('http-errors');

var express = require('express');
const session = require('express-session')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
let authRouter = require('./routes/auth')
const localStrategy = require('./strategy')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// session
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'whosyourdaddy',
    resave: false,
    saveUninitailized: false,
    cookie: { secure: false },
  })
);

// passport
passport.use(localStrategy);
// app.use(passport.initialize());
// app.use(passport.session());
// app.use(passport.authenticate('session'));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  })
});


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/', authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // Set locals, only providing error details in development mode
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error', {
    message: err.message, // Pass the error message
    error: err,           // Pass the full error object for stack trace, etc.
    status: err.status,   // Optionally pass the HTTP status code
  });
});


module.exports = app;
