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

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await getUserByEmail(email); // Implement this function to fetch user from DB
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, membership_status: user.membership_status },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        membership_status: user.membership_status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
  


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