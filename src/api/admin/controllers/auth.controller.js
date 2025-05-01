const { StatusCodes } = require("http-status-codes");
const Admin = require("../models/admin.model");
const logger = require("../../../utils/logger");

/**
 * @desc    Login admin
 * @route   POST /api/v1/admin/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message: "Please provide email and password",
      });
    }

    // Check for admin
    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(StatusCodes.FORBIDDEN).json({
        status: "error",
        message:
          "Your account has been deactivated. Please contact the super admin.",
      });
    }

    // Check if password matches
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // Update last login time
    admin.lastLogin = Date.now();
    await admin.save({ validateBeforeSave: false });

    // Generate token
    sendTokenResponse(admin, StatusCodes.OK, res);
  } catch (error) {
    logger.error(`Error in admin login: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get current logged in admin
 * @route   GET /api/v1/admin/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id);

    res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        admin,
      },
    });
  } catch (error) {
    logger.error(`Error in getMe: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Log admin out
 * @route   GET /api/v1/admin/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Successfully logged out",
    });
  } catch (error) {
    logger.error(`Error in logout: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Initialize admin
 * @route   POST /api/v1/admin/auth/init
 * @access  Public (but should be secured in production)
 */
const initializeAdmin = async (req, res, next) => {
  try {
    await Admin.createInitialAdmin();

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Initial admin created successfully",
    });
  } catch (error) {
    logger.error(`Error in initializeAdmin: ${error.message}`);
    next(error);
  }
};

// Helper function to generate token and send response
const sendTokenResponse = (admin, statusCode, res) => {
  // Create token
  const token = admin.getSignedJwtToken();

  // Remove sensitive data
  admin.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      },
    },
  });
};

module.exports = {
  login,
  getMe,
  logout,
  initializeAdmin,
};
