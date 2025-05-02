const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const Admin = require("../models/admin.model");
const logger = require("../../../utils/logger");

/**
 * Protect routes - verify JWT token and attach admin to request
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

      // Check if this is an admin token
      if (!decoded.isAdmin) {
        return res.status(StatusCodes.FORBIDDEN).json({
          status: "error",
          statusCode: StatusCodes.FORBIDDEN,
          message: "Not authorized to access admin routes",
        });
      }

      // Get admin from token
      const admin = await Admin.findById(decoded.id);

      // Check if admin exists
      if (!admin) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          status: "error",
          statusCode: StatusCodes.UNAUTHORIZED,
          message: "The admin belonging to this token no longer exists",
        });
      }

      // Check if admin is active
      if (!admin.isActive) {
        return res.status(StatusCodes.FORBIDDEN).json({
          status: "error",
          statusCode: StatusCodes.FORBIDDEN,
          message: "Your account has been deactivated",
        });
      }

      // Add admin to request
      req.admin = admin;
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
 * Authorize certain admin roles
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if admin role is in allowed roles
    if (!roles.includes(req.admin.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        status: "error",
        message: `Admin role ${req.admin.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

/**
 * Check if admin has specific resource permission
 * @param {string} resource - The resource to check permission for (e.g., 'customers', 'orders')
 * @param {string} action - The action to check ('read', 'write', 'delete')
 */
const hasPermission = (resource, action) => {
  return (req, res, next) => {
    // Super admin bypasses permission checks
    if (req.admin.role === "super-admin") {
      return next();
    }

    // Check if admin has the required permission
    if (!req.admin.permissions?.[resource]?.[action]) {
      return res.status(StatusCodes.FORBIDDEN).json({
        status: "error",
        message: `You don't have ${action} permission for ${resource}`,
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
  hasPermission,
};
