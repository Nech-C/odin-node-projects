const path = require('path');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const express = require('express');
const helmet = require('helmet');
const RateLimit = require("express-rate-limit");
const jwt = require('jsonwebtoken');
const e = require('express');

const apiRouter = require('./routes/api');
const pool = require('./db/pool');

const app = express();

// Security middlewares should come first
app.use(helmet());

app.use(cors({
  origin: 'http://localhost:5174',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Important for cookies/session
}));

const limiter = RateLimit({
    windowMs: 1 * 60 * 1000,
    max: 500,
});
app.use(limiter);

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());



// Compression should come after parsing but before routes
app.use(compression());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {
  console.log('Session:', req.session);
  console.log('User:', req.user);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api', apiRouter);
  


// Error handling middleware should be last
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json({ error: err.message });
});

module.exports = app;