const { body, validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");

// Validation middleware for registration
const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message: "Validation error",
        errors: errors
          .array()
          .map((err) => ({ field: err.path, message: err.msg })),
      });
    }
    next();
  },
];

// Validation middleware for login
const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email"),
  body("password").trim().notEmpty().withMessage("Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message: "Validation error",
        errors: errors
          .array()
          .map((err) => ({ field: err.path, message: err.msg })),
      });
    }
    next();
  },
];

module.exports = {
  validateRegister,
  validateLogin,
};
