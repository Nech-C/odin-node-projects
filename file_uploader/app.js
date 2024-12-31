var path = require('path');
var createError = require('http-errors');

var express = require('express');
const session = require('express-session')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport')
const { PrismaClient } = require('@prisma/client')

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let authRouter = require('./routes/auth')
let uploadRouter = require('./routes/upload')
const localStrategy = require('./strategy')

var app = express();
const prisma = new PrismaClient();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// session
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(
  session({
    secret: 'whosyourdaddy',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// passport
passport.use(localStrategy);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, user.id); // Store only the user ID in the session
  });
});

passport.deserializeUser(async function (id, cb) {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    cb(null, user); // Attach full user object to req.user
  } catch (err) {
    cb(err);
  }
});



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/user', usersRouter);
app.use('/', uploadRouter);
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
