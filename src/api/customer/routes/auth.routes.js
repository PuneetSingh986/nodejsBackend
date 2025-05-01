const express = require("express");
const {
  registerWithPhone,
  verifyOTP,
  resendOTP,
  completeProfile,
  getMe,
} = require("../controllers/auth.controller");
const {
  protect,
  requirePhoneVerified,
} = require("../middleware/auth.middleware");
const {
  registerWithPhoneRules,
  verifyOTPRules,
  resendOTPRules,
  completeProfileRules,
} = require("../validators/auth.validator");
const { validate } = require("../../../middleware/validation.middleware");

const router = express.Router();

// Public routes
router.post("/register", validate(registerWithPhoneRules), registerWithPhone);
router.post("/verify-otp", validate(verifyOTPRules), verifyOTP);
router.post("/resend-otp", validate(resendOTPRules), resendOTP);

// Protected routes
router.post(
  "/complete-profile",
  protect,
  requirePhoneVerified,
  validate(completeProfileRules),
  completeProfile
);
router.get("/me", protect, getMe);

module.exports = router;
