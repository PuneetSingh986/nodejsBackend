const { StatusCodes } = require("http-status-codes");
const User = require("../models/user.model");

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(StatusCodes.OK).json({
      status: "success",
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "error",
        message: `User not found with id of ${req.params.id}`,
      });
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin
const createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);

    res.status(StatusCodes.CREATED).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "error",
        message: `User not found with id of ${req.params.id}`,
      });
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "error",
        message: `User not found with id of ${req.params.id}`,
      });
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
