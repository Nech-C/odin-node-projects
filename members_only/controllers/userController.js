const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const pool = require('../db/pool');
const {insertUser} = require('../db/queries');
const jwt = require("jsonwebtoken");
exports.register = [
    body("first_name")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("First name must be specified.")
        .isAlphanumeric()
        .withMessage("First name has non-alphanumeric characters."),
    body("last_name")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("Last name must be specified.")
        .isAlphanumeric()
        .withMessage("Last name has non-alphanumeric characters."),
    body("email")
        .trim()
        .isEmail()
        .escape()
        .withMessage("Email must be specified.")
        .normalizeEmail(),
    body("password")
        .trim()
        .isLength({ min: 6 })
        .escape()
        .withMessage("Password must be at least 6 characters long."),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [req.body.email]);

            if (userExists.rows.length > 0) {
                return res.status(400).json({ message: "User already exists" });
            }

            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            
            const newUser = await insertUser(
                req.body.first_name,
                req.body.last_name,
                req.body.email,
                hashedPassword
            );

            res.status(201).json({
                message: "User registered successfully",
                user: {
                    id: newUser.id,
                    first_name: newUser.first_name,
                    last_name: newUser.last_name,
                    email: newUser.email,
                    membership_status: newUser.membership_status,
                    is_admin: newUser.is_admin
                }
            });
        } catch (error) {
            console.error('Error in user registration:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    }),
];

exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (user.rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.rows[0].id, email: user.rows[0].email, membership_status: user.rows[0].membership_status },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id: user.rows[0].id,
                email: user.rows[0].email,
                first_name: user.rows[0].first_name,
                last_name: user.rows[0].last_name,
                membership_status: user.rows[0].membership_status,
                is_admin: user.rows[0].is_admin
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});