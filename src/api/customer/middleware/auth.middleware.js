const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const Customer = require("../models/customer.model");
const logger = require("../../../utils/logger");

/**
 * Protect routes - verify JWT token and attach customer to request
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Extract token from header
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "Not authorized to access this route",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if decoded token has customer role
      if (decoded.role !== "customer") {
        return res.status(StatusCodes.FORBIDDEN).json({
          status: "error",
          statusCode: StatusCodes.FORBIDDEN,
          message: "Not authorized as a customer",
        });
      }

      // Get customer from token
      const customer = await Customer.findById(decoded.id);

      // Check if customer exists
      if (!customer) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          status: "error",
          statusCode: StatusCodes.UNAUTHORIZED,
          message: "The customer belonging to this token no longer exists",
        });
      }

      // Check if customer is active
      if (!customer.active) {
        return res.status(StatusCodes.FORBIDDEN).json({
          status: "error",
          statusCode: StatusCodes.FORBIDDEN,
          message: "This customer account has been deactivated",
        });
      }

      // Add customer to request
      req.customer = customer;
      next();
    } catch (error) {
      logger.error(`Auth middleware error: ${error.message}`);
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "Not authorized to access this route",
      });
    }
  } catch (error) {
    logger.error(`Auth middleware critical error: ${error.message}`);
    next(error);
  }
};

/**
 * Middleware to ensure customer's phone is verified
 */
const requirePhoneVerified = async (req, res, next) => {
  if (!req.customer.isPhoneVerified) {
    return res.status(StatusCodes.FORBIDDEN).json({
      status: "error",
      statusCode: StatusCodes.FORBIDDEN,
      message:
        "Phone verification required. Please verify your phone number first.",
    });
  }
  next();
};

/**
 * Middleware to ensure customer's profile is completed
 */
const requireProfileCompleted = async (req, res, next) => {
  if (!req.customer.profileCompleted) {
    return res.status(StatusCodes.FORBIDDEN).json({
      status: "error",
      statusCode: StatusCodes.FORBIDDEN,
      message:
        "Profile completion required. Please complete your profile first.",
    });
  }
  next();
};

module.exports = {
  protect,
  requirePhoneVerified,
  requireProfileCompleted,
};
