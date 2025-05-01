const { body, validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");

// Validation middleware for admin login
const validateAdminLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
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
  validateAdminLogin,
};
