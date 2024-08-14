const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const pool = require('../db/pool');
const {insertUser} = require('../db/queries');

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