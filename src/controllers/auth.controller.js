const { StatusCodes } = require("http-status-codes");
const User = require("../models/user.model");
const logger = require("../utils/logger");

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate token
    sendTokenResponse(user, StatusCodes.CREATED, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message: "Please provide an email and password",
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // Generate token
    sendTokenResponse(user, StatusCodes.OK, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(StatusCodes.OK).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    res.status(StatusCodes.OK).json({
      status: "success",
      message: "User logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Generate token, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};
