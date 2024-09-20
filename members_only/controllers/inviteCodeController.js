const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const makeMember = require('../db/queries').makeMember;
// In-memory storage for temporary data
const attemptStorage = {};
const inviteCodeStorage = [];

// Function to generate a random math question
function generateMathQuestion() {
    const operations = ['+', '-', '*'];
    const num1 = Math.floor(Math.random() * 10) + 1; // Random number between 1 and 10
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let answer;
    switch (operation) {
        case '+':
            answer = num1 + num2;
            break;
        case '-':
            answer = num1 - num2;
            break;
        case '*':
            answer = num1 * num2;
            break;
    }

    const question = `What is ${num1} ${operation} ${num2}?`;
    return { question, answer };
}

exports.getQuestion = asyncHandler(async (req, res) => {
    // Generate a random math question
    const { question, answer } = generateMathQuestion();

    // Create a unique identifier for this question attempt
    const attemptId = crypto.randomBytes(16).toString('hex');

    // Store the correct answer in memory, associated with the attemptId
    attemptStorage[attemptId] = {
        answer: answer,
        expiresAt: Date.now() + 600000 // 10 minutes from now
    };

    // Create a JWT token with just the attemptId
    const token = jwt.sign(
        { attemptId },
        process.env.JWT_SECRET,
        { expiresIn: '10m' } // Token expires in 10 minutes
    );

    // Send the question text and token to the client
    res.status(200)
        .json({ 
            token: token,
            question: question
        });
});

exports.checkAnswer = asyncHandler(async (req, res) => {
    const { token, answer } = req.body;

    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { attemptId } = decoded;

        // Retrieve the correct answer from memory
        const storedAttempt = attemptStorage[attemptId];

        if (!storedAttempt || Date.now() > storedAttempt.expiresAt) {
            delete attemptStorage[attemptId];
            return res.status(400).json({ message: 'Question expired or already answered' });
        }

        const correctAnswer = storedAttempt.answer;

        // Remove the stored answer to prevent reuse
        delete attemptStorage[attemptId];

        if (parseInt(answer) === correctAnswer) {
            // Generate invite code here
            const inviteCode = generateUniqueInviteCode();
            inviteCodeStorage.push(inviteCode);
            res.json({ success: true, invite_code: inviteCode });
            
        } else {
            res.status(400).json({ success: false, message: 'Incorrect answer' });
        }
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(400).json({ message: 'Question expired' });
        } else {
            res.status(400).json({ message: 'Invalid token' });
        }
    }
});

exports.validateInviteCode = asyncHandler(async (req, res) => {
    const { invite_code } = req.body;
    console.log(invite_code);
    if (inviteCodeStorage.includes(invite_code)) {
        console.log('index: %d', inviteCodeStorage.indexOf(invite_code));
        inviteCodeStorage.splice(inviteCodeStorage.indexOf(invite_code), 1);
        const user = await makeMember(req.user.id);
        res.json({ valid: true, user });
    } else {
        res.status(400).json({ valid: false });
    }
});



function generateUniqueInviteCode() {
    // Generate a random 6-character alphanumeric code
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Cleanup function to remove expired attempts (call this periodically)
function cleanupExpiredAttempts() {
    const now = Date.now();
    for (const [attemptId, attempt] of Object.entries(attemptStorage)) {
        if (now > attempt.expiresAt) {
            delete attemptStorage[attemptId];
        }
    }
}

// Set up a periodic cleanup (e.g., every 5 minutes)
setInterval(cleanupExpiredAttempts, 300000);