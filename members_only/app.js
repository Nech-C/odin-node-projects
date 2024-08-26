const path = require('path');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const express = require('express');
const helmet = require('helmet');
const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const session = require("express-session");
const RateLimit = require("express-rate-limit");

const apiRouter = require('./routes/api');
const pool = require('./db/pool');
const e = require('express');

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
    max: 20,
});
app.use(limiter);

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || "cats", // Use environment variable in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'none' // This is needed for cross-origin cookies
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Compression should come after parsing but before routes
app.use(compression());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Passport configuration
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      const user = rows[0];
      if (!user) {
        return done(null, false, { message: "Incorrect email" });
      }
      const match = await bcrypt.compare(password, user.password_hash);

      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }

      return done(null, user);
    } catch(err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    const user = rows[0];
    done(null, user);
  } catch(err) {
    done(err);
  }
});

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api', apiRouter);

app.post("/api/login", (req, res, next) => {
  passport.authenticate("local", (err, u, info) => {
    console.log(u);
    if (err) {
      return next(err);
    }
    if (!u) {
      return res.status(401).json({ 
        message: info.message
      });
    }
    req.logIn(u, (err) => {
      if (err) {
        return next(err);
      }
      return res.json({
        message: "Login successful",
        user: {
          id: u.id,
          email: u.email,
          first_name: u.first_name,
          last_name: u.last_name
        }
      });
    });
  })(req, res, next);
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