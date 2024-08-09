const User = require("../models/user");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");


exports.user_create_get = asyncHandler(async (req, res, next) => {
    // TODO: Implement user creation logi
});

exports.registerUser = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !password) {
        res.status(400).json({ message: "Please enter all fields" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json( {message: "User registered successfully"} );

        
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: "Server error" });
    }
});

exports.user_update_get = asyncHandler(async (req, res, next) => {
    // TODO: Implement user update form rendering logic
});

exports.user_update_post = asyncHandler(async (req, res, next) => {
    // TODO: Implement user update logic
});

exports.user_delete_get = asyncHandler(async (req, res, next) => {
    // TODO: Implement user delete form rendering logic
});

exports.user_delete_post = asyncHandler(async (req, res, next) => {
    // TODO: Implement user delete logic
});
