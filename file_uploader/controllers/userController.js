const { PrismaClient } = require("@prisma/client");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcrypt')

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
            console.log(errors.array());
            const username = req.body.username || '';
            const password = req.body.password || '';
            return res.status(400).render('sign_up',
                { errors: errors.array(), username: username, password: password}
            );
        }

        try {
            const userExists = await prisma.user.findFirst({
                where: {
                    username: req.body.username,
                },
            })

            if (userExists) {
                const errors = [{msg: "username exists!"}];
                const username = req.body.username || '';
                const password = req.body.password || '';
                return res.status(400).render('sign_up',
                    { errors: errors, username: username, password: password}
                );
            }

            // console.log(`unmae: ${req.body.username} password: ${req.body.password}`)
            hashed_password = await bcrypt.hash(req.body.password, 10)
            
            const [user, rootFolder] = await prisma.$transaction([
                prisma.user.create({
                    data: {
                        username: req.body.username,
                        password: req.body.password,
                    }
                }),
                prisma.folder.create({
                    data: {
                        name: 'root',
                        parentId: null,
                    }
                }),
            ]);

            await prisma.user.update({
                where: { id: user.id },
                data: { rootFolderId: rootFolder.id },
            });

            res.status(200).send("User create!");
        } catch (error) {
            console.log('Error in user registration', error);
            const errors = [{msg: "Internal server error"}];
            const username = req.body.username || '';
            const password = req.body.password || '';
            return res.status(500).render('sign_up',
                { errors: errors, username: username, password: password}
            );
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