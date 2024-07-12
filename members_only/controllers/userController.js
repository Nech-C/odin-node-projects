const User = require("../models/user");

const asyncHandler = require("express-async-handler");

const { body, validationResult } = require("express-validator");

exports.user_create_get = asyncHandler(async (req, res, next) => {
    // TODO: Implement user creation logi
});

exports.user_create_post = asyncHandler(async (req, res, next) => {
    // TODO: Implement user creation logic
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
