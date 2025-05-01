const { body } = require("express-validator");
const mongoose = require("mongoose");

// Helper function to check if a string is a valid MongoDB ObjectId
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// Validation rules for phone registration
const registerWithPhoneRules = [
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\+?[1-9]\d{9,14}$/)
    .withMessage("Please provide a valid phone number"),
];

// Validation rules for OTP verification
const verifyOTPRules = [
  body("customerId")
    .notEmpty()
    .withMessage("Customer ID is required")
    .custom(isValidObjectId)
    .withMessage("Invalid customer ID format"),
  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers"),
];

// Validation rules for resending OTP
const resendOTPRules = [
  body("customerId")
    .notEmpty()
    .withMessage("Customer ID is required")
    .custom(isValidObjectId)
    .withMessage("Invalid customer ID format"),
];

// Validation rules for profile completion
const completeProfileRules = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("address.street").optional().trim(),
  body("address.city").optional().trim(),
  body("address.state").optional().trim(),
  body("address.zipCode").optional().trim(),
  body("address.country").optional().trim(),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Date of birth must be a valid date"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other", "prefer not to say"])
    .withMessage("Gender must be valid"),
];

module.exports = {
  registerWithPhoneRules,
  verifyOTPRules,
  resendOTPRules,
  completeProfileRules,
};
