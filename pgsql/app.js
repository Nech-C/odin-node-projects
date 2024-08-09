const express = require('express');
const app = express();
const indexRouter = require('./routes/index');
const path = require('path');

app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "pug");


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/new', indexRouter);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = err;

  // render the error page
  res.status(err.status || 500);
  res.send(err.message);
});

module.exports = app;