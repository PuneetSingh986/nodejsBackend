const { StatusCodes } = require("http-status-codes");
const logger = require("../../../utils/logger");
const authService = require("../services/auth.service");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../../../utils/response.utils");

/**
 * @desc    Register a new customer with phone number
 * @route   POST /api/v1/customer/auth/register
 * @access  Public
 */
const registerWithPhone = async (req, res, next) => {
  try {
    const { phone } = req.body;

    // Check if customer already exists
    let customer = await authService.findCustomerByPhone(phone);

    if (customer && customer.isPhoneVerified) {
      return sendErrorResponse(
        res,
        StatusCodes.CONFLICT,
        "Phone number already registered"
      );
    }

    if (!customer) {
      // Create new customer with phone
      customer = await authService.createCustomer(phone);

      if (!customer) {
        return sendErrorResponse(
          res,
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Failed to create customer"
        );
      }
    }

    // Generate and send OTP
    const isOTPSent = await authService.generateAndSendOTP(customer);

    if (!isOTPSent) {
      return sendErrorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to send OTP. Please try again."
      );
    }

    sendSuccessResponse(
      res,
      StatusCodes.OK,
      { customerId: customer._id },
      "OTP sent to your phone number"
    );
  } catch (error) {
    logger.error(`Error in registerWithPhone: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Login customer with phone number
 * @route   POST /api/v1/customer/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { phone } = req.body;

    // Check if customer exists
    const customer = await authService.findCustomerByPhone(phone);

    if (!customer) {
      return sendErrorResponse(
        res,
        StatusCodes.NOT_FOUND,
        "No account found with this phone number"
      );
    }

    if (!customer.isPhoneVerified) {
      return sendErrorResponse(
        res,
        StatusCodes.FORBIDDEN,
        "Phone number not verified. Please register first."
      );
    }

    // Generate and send OTP
    const isOTPSent = await authService.generateAndSendOTP(customer);

    if (!isOTPSent) {
      return sendErrorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to send OTP. Please try again."
      );
    }

    sendSuccessResponse(
      res,
      StatusCodes.OK,
      { customerId: customer._id },
      "OTP sent to your phone number for login"
    );
  } catch (error) {
    logger.error(`Error in login: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/v1/customer/auth/verify-otp
 * @access  Public
 */
const verifyOTP = async (req, res, next) => {
  try {
    const { customerId, otp } = req.body;

    // Verify OTP
    const customer = await authService.verifyCustomerOTP(customerId, otp);

    if (!customer) {
      return sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Invalid or expired OTP"
      );
    }

    // Update last login timestamp
    await authService.updateLastLogin(customer._id);

    // Generate token response
    const tokenData = authService.generateTokenResponse(customer);

    sendSuccessResponse(
      res,
      StatusCodes.OK,
      tokenData,
      "Phone number verified successfully"
    );
  } catch (error) {
    logger.error(`Error in verifyOTP: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/v1/customer/auth/resend-otp
 * @access  Public
 */
const resendOTP = async (req, res, next) => {
  try {
    const { customerId } = req.body;

    // Find customer
    const customer = await authService.findCustomerByPhone(null, customerId);

    if (!customer) {
      return sendErrorResponse(
        res,
        StatusCodes.NOT_FOUND,
        "Customer not found"
      );
    }

    // Generate and send OTP
    const isOTPSent = await authService.generateAndSendOTP(customer);

    if (!isOTPSent) {
      return sendErrorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to send OTP. Please try again."
      );
    }

    sendSuccessResponse(
      res,
      StatusCodes.OK,
      null,
      "OTP resent to your phone number"
    );
  } catch (error) {
    logger.error(`Error in resendOTP: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Complete customer profile
 * @route   POST /api/v1/customer/auth/complete-profile
 * @access  Private
 */
const completeProfile = async (req, res, next) => {
  try {
    // Get customer ID from authenticated token middleware
    const customerId = req.customer.id;

    // Complete profile
    const customer = await authService.completeCustomerProfile(
      customerId,
      req.body
    );

    if (!customer) {
      return sendErrorResponse(
        res,
        StatusCodes.NOT_FOUND,
        "Customer not found"
      );
    }

    sendSuccessResponse(
      res,
      StatusCodes.OK,
      { customer },
      "Profile completed successfully"
    );
  } catch (error) {
    logger.error(`Error in completeProfile: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get current customer profile
 * @route   GET /api/v1/customer/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    // Customer is already attached to req by the auth middleware
    const customer = req.customer;

    sendSuccessResponse(res, StatusCodes.OK, { customer });
  } catch (error) {
    logger.error(`Error in getMe: ${error.message}`);
    next(error);
  }
};

module.exports = {
  registerWithPhone,
  login,
  verifyOTP,
  resendOTP,
  completeProfile,
  getMe,
};
