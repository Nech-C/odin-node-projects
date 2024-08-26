const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { getMessages, insertMessage } = require("../db/queries");

exports.getAllMessages = asyncHandler(async (req, res) => {
    const messages = await getMessages();
    res.status(200).json(messages);
});

exports.postMessage = [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        try {
            const { title, content } = req.body;
            const newMessage = await insertMessage(title, content, req.user.id);
            res.status(201).json({ message: "Message posted successfully", data: newMessage });
        } catch (error) {
            console.error("Error posting message:", error);
            res.status(500).json({ message: "Error posting message", error: error.message });
        }
    })
];