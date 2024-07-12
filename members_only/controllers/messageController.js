const Message = require("../models/message");

const asyncHandler = require("express-async-handler");

const { body, validationResult } = require("express-validator");

exports.message_create_get = asyncHandler(async (req, res, next) => {
    // TODO: Implement message creation logic
});

exports.message_create_post = asyncHandler(async (req, res, next) => {
    // TODO: Implement message creation logic
});

exports.message_update_get = asyncHandler(async (req, res, next) => {
    // TODO: Implement message update logic
});

exports.message_update_post = asyncHandler(async (req, res, next) => {
    // TODO: Implement message update logic
});

exports.message_delete_get = asyncHandler(async (req, res, next) => {
    // TODO: Implement message deletion logic
});

exports.message_delete_post = asyncHandler(async (req, res, next) => {
    // TODO: Implement message deletion logic
});