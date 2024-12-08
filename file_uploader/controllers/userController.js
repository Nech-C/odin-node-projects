const { PrismaClient } = require("@prisma/client");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const prisma = new PrismaClient();

module.exports.createUser = [
    body('uname')
        .trim()
        .isLength({ min:6 })
        .escape()
        .withMessage('A username mush be provided!')
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
                    return res.status(400).json({ message: "username exists" })
                }

                const usesr = await prisma.user.create({
                    data: {
                        username: req.body.uname,
                        password: req.body.pword,
                    },
                });
            } catch (error) {
                console.error('Error in user registration', error);
                res.status(500).json({ message: "Internal server error" })
            }
        })
];
