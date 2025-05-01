const { validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");

/**
 * Validation middleware factory
 * @param {array} validations - Array of express-validator validation chains
 * @returns {array} - Middleware array with validations and error handler
 */
const validate = (validations) => {
  return [
    // Run all validations
    ...validations,

    // Handle validation errors
    (req, res, next) => {
      const errors = validationResult(req);

      if (errors.isEmpty()) {
        return next();
      }

      // Format validation errors
      const formattedErrors = errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      }));

      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message: "Validation error",
        errors: formattedErrors,
      });
    },
  ];
};

module.exports = {
  validate,
};
