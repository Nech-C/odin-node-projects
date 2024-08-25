const path = require('path');

const { Pool } = require("pg");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const cors = require("cors");

const pool = new Pool({
    host: "localhost",
    user: "nech",
    database: "auth",
    password: "1234567",
    port: 5432
})


const app = express();

app.use(cors({
    origin: "http://localhost: 5174",
    credentials: true
}))

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");


app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(express.urlencoded({ extended: false }));
app.use(passport.session());

passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        const user = rows[0];

        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
      } catch(err) {
        return done(err);
      }
    })
  );

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
  

app.get("/", (req, res) => {
    res.render("index", { title: "hello", user: req.user });
});

app.get("/sign-up", (req, res) => {
    res.render("sign-up-form", { title: "Sign Up"});
});

app.post("/sign-up", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

    try {
        await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)",
            [
                req.body.username,
                hashedPassword
            ]);

        res.redirect("/");
    } catch(err) {
        return next(err);
    }
});

app.post("/api/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).json({ message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json({ message: "Login successful", user: { id: user.id, email: user.email } });
    });
  })(req, res, next);
});

app.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
  

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.on("error", (err) => console.error(err));
app.listen(3000, () => console.log("app listening on port 3000!"));