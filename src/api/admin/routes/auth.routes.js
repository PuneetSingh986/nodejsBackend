const express = require("express");
const {
  login,
  getMe,
  logout,
  initializeAdmin,
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { validateAdminLogin } = require("../validators/auth.validator");

const router = express.Router();

// Public routes
router.post("/login", validateAdminLogin, login);
router.post("/init", initializeAdmin);

// Protected routes
router.get("/me", protect, getMe);
router.get("/logout", protect, logout);

module.exports = router;
