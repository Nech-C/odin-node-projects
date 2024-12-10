const { PrismaClient } = require("@prisma/client");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const prisma = new PrismaClient();

module.exports.createUser = [
    body('uname')
        .trim()
        .isLength({ min:6 })
        .escape()
        .withMessage('The username must have at least 6 characters!')
        .isAlphanumeric()
        .withMessage('The username cannot have non-alphanumeric characters!'),

    body('pword')
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
                    username: req.body.uname,
                },
            })

            if (userExists) {
                return res.status(400).json({ message: "username exists" });
            }

            // console.log(`unmae: ${req.body.uname} pword: ${req.body.pword}`)

            const user = await prisma.user.create({
                data: {
                    username: req.body.uname,
                    password: req.body.pword,
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
