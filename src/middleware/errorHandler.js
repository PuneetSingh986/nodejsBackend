const { StatusCodes } = require("http-status-codes");
const logger = require("../utils/logger");

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || "Something went wrong, please try again later",
  };

  // Log error
  logger.error(`${err.name || "Error"}: ${err.message || "Unknown error"}`);
  if (process.env.NODE_ENV === "development") {
    logger.error(err.stack);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    customError.message = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Mongoose duplicate key error
  if (err.code && err.code === 11000) {
    customError.message = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please choose another value`;
    customError.statusCode = StatusCodes.CONFLICT;
  }

  // Mongoose cast error (invalid ID)
  if (err.name === "CastError") {
    customError.message = `No item found with id: ${err.value}`;
    customError.statusCode = StatusCodes.NOT_FOUND;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    customError.message = "Invalid token. Please log in again";
    customError.statusCode = StatusCodes.UNAUTHORIZED;
  }

  if (err.name === "TokenExpiredError") {
    customError.message = "Your token has expired. Please log in again";
    customError.statusCode = StatusCodes.UNAUTHORIZED;
  }

  return res.status(customError.statusCode).json({
    status: "error",
    message: customError.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
