const { PrismaClient } = require("@prisma/client");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const prisma = new PrismaClient();

module.exports.createUser = [
    body('username')
        .trim()
        .isLength({ min:6 })
        .escape()
        .withMessage('The username must have at least 6 characters!')
        .isAlphanumeric()
        .withMessage('The username cannot have non-alphanumeric characters!'),

    body('password')
        .trim()
        .isLength({ min: 8 })
        .withMessage("Password must have at least 8 character!"),
    
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const userExists = await prisma.user.findFirst({
                where: {
                    username: req.body.username,
                },
            })

            if (userExists) {
                return res.status(400).json({ message: "username exists" });
            }

            // console.log(`unmae: ${req.body.username} password: ${req.body.password}`)

            const user = await prisma.user.create({
                data: {
                    username: req.body.username,
                    password: req.body.password,
                },
            });

            if (user) {
                res.status(200).send("User create!")
              } else {
                res.status(500).send("User creation failed.")
              }

        } catch (error) {
            console.log('Error in user registration', error);
            res.status(500).json({ message: "Internal server error" });
        }
    })
];

module.exports.getUser = asyncHandler(async (req, res, next) => {
    const userId = req.body.userId;

    const user = prisma.user.findFirst({
        where: {
            id: userId
        }
    });

    if (user) {
        res.status(200).send(user);
    } else {
        res.status(404).send('user not found!');
    }
});